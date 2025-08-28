# Full-Stack Developer Technical Assessment 

## Overview

Build a **Task Management System** with a RESTful API backend and a React frontend. This assessment evaluates your API development skills, React knowledge, and ability to integrate both components.




### Core Features to Implement

### 1. Task Management API

Create the following endpoints:

```
Retrieve all tasks
Create a new task
Retrieve specific task
Update existing task
Delete task
Get task statistics

```

### 2. Task Data Model

Each task should include:

```json
{
  "id": "string|number",
  "title": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "status": "enum: pending|in_progress|completed",
  "priority": "enum: low|medium|high",
  "dueDate": "ISO date string (optional)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}

```

### 3. Validation & Error Handling

- Implement proper input validation
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Handle edge cases (invalid IDs, missing data, etc.)

### 4. Statistics Endpoint

Return task counts by status and priority:

```json
{
  "totalTasks": 15,
  "byStatus": {
    "pending": 5,
    "in_progress": 3,
    "completed": 7
  },
  "byPriority": {
    "low": 4,
    "medium": 8,
    "high": 3
  }
}

```

### 5. Database & Infrastructure

- Use a **real database** (PostgreSQL, MySQL, MongoDB, or SQLite)
- Implement proper database schema/collections
- Include database migrations or initialization scripts
- Use environment variables for database configuration
- Provide Docker Compose setup for easy development

### 6. Additional Requirements

- Enable CORS for frontend integration
- Add basic logging for requests
- Include API documentation (README or comments)
- **Docker containerization** with proper Dockerfile


### Core Features to Implement

### 1. Task List View

- Display all tasks in a responsive layout
- Show task title, status, priority, and due date
- Implement status-based color coding
- Add loading states during API calls

### 2. Task Creation Form

- Modal or dedicated page for creating tasks
- Form validation with error display
- All required fields with appropriate input types
- Clear success/error feedback

### 3. Task Management

- Edit existing tasks (inline or modal)
- Delete tasks with confirmation
- Mark tasks as completed
- Filter tasks by status and/or priority

### 4. Dashboard/Statistics

- Display task statistics from API

### 5. React-Specific Requirements

- Use React hooks (useState, useEffect, custom hooks)
- Implement proper component structure
- Handle loading and error states
- Optimize re-renders where appropriate
- Use controlled components for forms

### 6. TypeScript & Infrastructure Requirements

- Type definitions for API responses and props
- Interfaces for all data models
- Environment-based configuration
- Intuitive navigation and interactions
- Proper accessibility (ARIA labels, keyboard navigation)


