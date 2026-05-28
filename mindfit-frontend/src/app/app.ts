import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './layout/toast-host/toast-host.component';
import { ConfirmDialogHostComponent } from './shared/confirm-dialog/confirm-dialog-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, ConfirmDialogHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
