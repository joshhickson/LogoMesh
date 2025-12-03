# @logomesh/contracts

**⚠️ NOTE: This package does NOT contain Smart Contracts.**

In the context of this repository, `contracts` refers to **System Contracts** (Shared Interfaces, DTOs, and Type Definitions) that define the "contract" between different services in the LogoMesh monorepo (e.g., between the Server and the Workers).

## Purpose

This package serves as the single source of truth for:
*   **Domain Entities:** `Thought`, `Segment`, `AnalysisReport`.
*   **API DTOs:** Request/Response shapes for the API.
*   **Service Interfaces:** Definitions for `StorageAdapter`, `QueueAdapter`, etc.

## Why is it named "Contracts"?

It follows the "Design by Contract" philosophy where the interface definitions form a binding contract between the consumer and the provider, ensuring type safety across the distributed system.
