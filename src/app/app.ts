import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="container">
      <header class="header">
        <h1>Pollinate Task</h1>
        <p class="sub">Users & To-Dos</p>
      </header>

      <router-outlet />
    </main>
  `,
  styles: [`
    .container { max-width: 960px; margin: 0 auto; padding: 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    .header { margin-bottom: 16px; }
    .sub { margin: 0; opacity: 0.8; }
  `]
})
export class App {
  title = signal('Pollinate Frontend Task');
}
