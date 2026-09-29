import { requestAPI } from '../utils';
import {
  CourseListResponse,
  AssignmentListResponseWithEnhancedState,
  APIResponse,
  GeneratePreviewResponse
} from '../types/api';

export const apiService = {
  courses: {
    getAll: () => requestAPI<CourseListResponse>('bitsygrader/courses'),
    
    create: (courseData: {
      label: string;
      title: string;
      lti_id: string;
      active: boolean;
    }) => requestAPI<APIResponse>('bitsygrader/courses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    }),
    
    update: (courseLabel: string, courseData: {
      title?: string;
      lti_id?: string;
      active?: boolean;
    }) => requestAPI<APIResponse>(`bitsygrader/courses/${courseLabel}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    }),
    
    delete: (courseLabel: string) => 
      requestAPI(`bitsygrader/courses/${courseLabel}/delete`, {
        method: 'DELETE'
      })
  },

  assignments: {
    getAll: (courseId: string) => 
      requestAPI<AssignmentListResponseWithEnhancedState>(
        `bitsygrader/courses/${courseId}/assignments`
      ),
    
    create: (courseId: string, payload: any) =>
      requestAPI<APIResponse>(`bitsygrader/courses/${courseId}/assignments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
    
    fetch: (courseId: string, assignmentId: string, solution: boolean = false) =>
      requestAPI<APIResponse>(
        `bitsygrader/courses/${courseId}/assignments/${assignmentId}/fetch${solution ? '?solution=true' : ''}`
      ),
    
    submit: (courseId: string, assignmentId: string) =>
      requestAPI<APIResponse>(
        `bitsygrader/courses/${courseId}/assignments/${assignmentId}/submit`,
        { method: 'POST' }
      ),
    
    delete: (courseId: string, assignmentId: string) =>
      requestAPI<APIResponse>(
        `bitsygrader/courses/${courseId}/assignments/${assignmentId}/delete`,
        { method: 'DELETE' }
      )
  },

  auth: {
    whoami: () => requestAPI<APIResponse>('bitsygrader/auth/whoami')
  },

  generator: {
    generatePreview: (notebooks: any[], assets: any[]) =>
      requestAPI<GeneratePreviewResponse>('bitsygrader/generate_assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebooks, assets })
      })
  }
};
