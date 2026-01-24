from abc import abstractmethod
from pydantic import ValidationError

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.tasks import TaskUpdater
from a2a.types import (
    InvalidParamsError,
    Task,
    TaskState,
    UnsupportedOperationError,
    InternalError,
)
from a2a.utils import (
    new_agent_text_message,
    new_task,
)
from a2a.utils.errors import ServerError

from agentbeats.models import EvalRequest


class GreenAgent:

    @abstractmethod
    async def run_eval(self, request: EvalRequest, updater: TaskUpdater) -> None:
        pass

    @abstractmethod
    def validate_request(self, request: EvalRequest) -> tuple[bool, str]:
        pass


class GreenExecutor(AgentExecutor):

    def __init__(self, green_agent: GreenAgent):
        self.agent = green_agent

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        import json
        request_text = context.get_user_input()
        print("[DEBUG][TOP] request_text received in GreenExecutor:", repr(request_text))
        print(f"[DEBUG][TOP] type(request_text): {type(request_text)}")
        # Patch: If request_text is a JSON string, parse it before validation
        if isinstance(request_text, str):
            try:
                if request_text.strip().startswith('{'):
                    request_text_parsed = json.loads(request_text)
                    print("[DEBUG] Parsed request_text as JSON.")
                else:
                    request_text_parsed = request_text
            except Exception as e:
                print(f"[PATCH] Failed to parse request_text as JSON: {e}")
                request_text_parsed = request_text
        else:
            request_text_parsed = request_text
        print(f"[DEBUG] type(request_text) AFTER parsing: {type(request_text_parsed)}")
        print(f"[DEBUG] request_text_parsed: {repr(request_text_parsed)}")
        try:
            req: EvalRequest = EvalRequest.model_validate(request_text_parsed)
            ok, msg = self.agent.validate_request(req)
            if not ok:
                raise ServerError(error=InvalidParamsError(message=msg))
        except ValidationError as e:
            print(f"[DEBUG][EXCEPTION] ValidationError: {e}")
            raise ServerError(error=InvalidParamsError(message=e.json()))

        # Stop the process after handling the first request for debugging
        print("[DEBUG] Stopping green-agent after first request for debugging.")
        import sys
        sys.exit(0)

        msg = context.message
        if msg:
            task = new_task(msg)
            await event_queue.enqueue_event(task)
        else:
            raise ServerError(error=InvalidParamsError(message="Missing message."))

        updater = TaskUpdater(event_queue, task.id, task.context_id)
        await updater.update_status(
            TaskState.working,
            new_agent_text_message(f"Starting assessment.\n{req.model_dump_json()}", context_id=context.context_id)
        )

        try:
            await self.agent.run_eval(req, updater)
            await updater.complete()
        except Exception as e:
            print(f"Agent error: {e}")
            await updater.failed(new_agent_text_message(f"Agent error: {e}", context_id=context.context_id))
            raise ServerError(error=InternalError(message=str(e)))

    async def cancel(
        self, request: RequestContext, event_queue: EventQueue
    ) -> Task | None:
        raise ServerError(error=UnsupportedOperationError())
