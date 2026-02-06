import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../core/services/users.service';

describe('UsersListComponent', () => {
  let fixture: ComponentFixture<UsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: {
            getUsers: () =>
              of([
                { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'leanne@example.com' },
                { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'ervin@example.com' },
              ]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
  });

  it('renders a list of users', () => {
    fixture.detectChanges(); // triggers ngOnInit() -> fetchUsers()

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Leanne Graham');
    expect(el.textContent).toContain('Ervin Howell');
  });
});
