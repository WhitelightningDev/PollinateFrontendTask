import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewTodoInput, Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/todos';

  constructor(private http: HttpClient) {}

  // This is a function the gets all the todos from the API and returns an Observable of an array of Todo objects.
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  // This is a function that gets a single todo by its ID from the API and returns an Observable of a Todo object.
  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  // This is a function that creates a new todo by sending a POST request to the API with the new todo data and returns an Observable of the created Todo object.
  createTodo(todo: NewTodoInput): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  // This is a function that updates an existing todo by sending a PUT request to the API with the updated todo data and returns an Observable of the updated Todo object.
  updateTodo(id: number, todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo);
  }

  // This is a function that deletes a todo by sending a DELETE request to the API with the ID of the todo to be deleted and returns an Observable of void (indicating that there is no response body).
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
