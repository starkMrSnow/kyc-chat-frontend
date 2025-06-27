// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AdminChatComponent } from './components/admin-chat.component/admin-chat.component';
import { CustomerChatComponent } from './components/customer-chat.component/customer-chat.component';

export const routes: Routes = [
  { path: 'admin-chat', component: AdminChatComponent },
  { path: 'customer-chat', component: CustomerChatComponent },
  { path: '', redirectTo: 'admin-chat', pathMatch: 'full' }, // optional default route
];
