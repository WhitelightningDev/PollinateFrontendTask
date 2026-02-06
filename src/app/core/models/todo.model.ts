// Todos model (JSONPlaceholder uses `userId`)
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export type NewTodoInput = Pick<Todo, 'userId' | 'title' | 'completed'>;
