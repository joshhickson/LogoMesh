# PHASE 2 ADDENDUM: Text-to-Speech (TTS) Plugin & Voice Output Integration

**Date:** June 01, 2025  
**Version:** 1.0

**Prerequisite:** Completion of Phase 1, including a functional `EventBus`, `PluginHost`, `ContextStateService`, and the ability to statically register and invoke plugins. Optional: basic `ThoughtFocus` or `SegmentSelect` events emitting from the UI or API.

**Overall Goal for this Addendum:**  
To establish an extensible, event-driven Text-to-Speech (TTS) framework within LogoMesh. This allows selected thoughts or segments to be spoken aloud using a pluggable voice engine—starting with lightweight retro-compatible APIs (like `Microsoft Sam`) and scaling to neural voice models in later phases. The system must support modular voice engine registration and user voice plugin selection at install time.

---

## Theme 1: Voice Output as a Plugin

- **Sub-Theme 1.1: Foundational TTS Plugin Interface**
    
    - **Concept:** A minimal, standardized interface for voice plugins that allows them to receive structured text and read it aloud.
        
    - **Modules/Features:**
        
        1. **Define `TTSSpeaker` Interface (`@contracts/plugins/ttsSpeaker.ts`):**
            
            - Methods:
                
                ```ts
                interface TTSSpeaker {
                  speakText(text: string, voiceId?: string): Promise<void>;
                  getAvailableVoices(): Promise<string[]>;
                }
                ```
                
        2. **Default Plugin: `BasicTTSPlugin` (`@plugins/tts/basicTTSPlugin.ts`)**:
            
            - Uses `child_process.spawn()` to invoke external tools:
                
                - Windows: PowerShell with `SAPI.SpVoice` or `Microsoft Sam`.
                    
                - macOS/Linux: `say`, `espeak`, or custom shell commands.
                    
            - Registers itself with `PluginHost` under label `tts.basic`.
                
            - Hardcoded fallback voice list: `['Default']`.
                
        
        - **Verification:** Plugin loads and is callable via `PluginAPI.speak("hello world")`. A voice output is heard via system TTS.
            

---

## Theme 2: Event-Driven Voice Triggers

- **Sub-Theme 2.1: Listen & Speak on Focus**
    
    - **Concept:** Hook into `EventBus` to respond to `thoughtFocused` or `segmentSelected` events with voice playback.
        
    - **Modules/Features:**
        
        1. **Register TTS Playback Handler in Plugin Init:**
            
            - Listen for:
                
                ```ts
                EventBus.on("context/thoughtFocused", ({ thought }) => { /* speak */ });
                EventBus.on("context/segmentSelected", ({ segment }) => { /* speak */ });
                ```
                
            - Sanitize text and call `ttsPlugin.speakText(thought.content)`.
                
        2. **User Toggle: `[TOGGLE_TTS_ON_FOCUS]` (System Config or UI):**
            
            - **If ON:** Thoughts are read aloud automatically when focused/selected.
                
            - **If OFF:** No automatic playback; must be triggered via UI/API.
                
        
        - **Verification:** Selecting a thought triggers spoken output if toggle is enabled.
            

---

## Theme 3: Installer Integration for Voice Plugin Selection

- **Sub-Theme 3.1: Plugin Choice During Setup**
    
    - **Concept:** Let users select a default TTS engine at install or runtime. Future support for neural TTS models (e.g., Piper, Coqui).
        
    - **Modules/Features:**
        
        1. **Extend `pluginManifest.schema.json`:**
            
            - New capability: `"canSpeak": true`
                
            - Label: `"voicePlugin": true`
                
        2. **Config Option: `defaultTTSPluginId` (e.g., `"tts.basic"`, `"tts.coqui"`)**
            
            - Used by `PluginHost.getPluginByCapability("voicePlugin")`.
                
        3. **UI/CLI Option: `Select TTS Engine`**
            
            - Shown during first-time install or in settings panel.
                
            - Lists all registered `TTSSpeaker` plugins and available voices.
                
        
        - **Verification:** User can select a voice engine and test its output from settings.
            

---

## Theme 4: Developer Experience & Expansion Path

- **Sub-Theme 4.1: Preparing for Neural TTS**
    
    - **Concept:** Design TTS plugin interface so it remains compatible with more advanced engines.
        
    - **Modules/Features:**
        
        1. **Create Stub Plugin: `NeuralTTSPlugin`**
            
            - Placeholder for future GPU/local model TTS (e.g., Coqui, Piper).
                
            - Accepts `voiceId`, `emotion`, `speed`, etc.
                
        2. **Add Test Hook:**
            
            ```ts
            POST /api/tts/test
            {
              "text": "LogoMesh is alive",
              "voiceId": "default"
            }
            ```
            
        
        - **Verification:** Neural plugin can be toggled/tested, even if implementation is not final in this phase.
            

---

**Implications for Phase 2 Timeline & Scope:**

- This addendum can be executed rapidly—`BasicTTSPlugin` is low-code and cross-platform via CLI wrappers.
    
- Voice output introduces a new sensory modality that reinforces cognition and accessibility.
    
- The plugin-based design ensures that users can upgrade from funny/retro options (like Microsoft Sam) to high-quality voices without re-architecting the system.
    
- Optional future support for voice logs (e.g., tracking what was spoken when) can integrate seamlessly via `LLMAuditLogger` or a new `TTSAuditLog`.
    

---

Let me know if you’d like this as a `.md` file to commit or revise in your GitHub repo.