import { TestBed } from '@angular/core/testing';
import { filter, firstValueFrom, of, take } from 'rxjs';

import { TodosStore } from './todos.store';
import { TodosService } from '../services/todos.service';

describe('TodosStore', () => {
  let store: TodosStore;
  let todosService: Pick<TodosService, 'getTodos'>;

  beforeEach(() => {
    todosService = {
      getTodos: () => of([]),
    };

    TestBed.configureTestingModule({
      providers: [
        TodosStore,
        {
          provide: TodosService,
          useValue: {
            getTodos: todosService.getTodos,
          },
        },
      ],
    });

    store = TestBed.inject(TodosStore);
  });

  it('adds a new todo into local state and exposes it via todosForUser$', async () => {
    // Arrange
    const userId = 3;

    // Act
    store.addTodo({ userId, title: 'Buy milk', completed: false });

    // Assert
    const todos = await firstValueFrom(
      store.todosForUser$(userId).pipe(
        filter((items) => items.length === 1),
        take(1),
      ),
    );

    expect(todos[0].userId).toBe(userId);
    expect(todos[0].title).toBe('Buy milk');
    expect(todos[0].completed).toBe(false);
    expect(typeof todos[0].id).toBe('number');
  });
});
