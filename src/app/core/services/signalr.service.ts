import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private connection!: HubConnection;

  stockUpdated$ = new Subject<{branchId: number, productId: number, newStock: number}>();
  branchProductsUpdated$ = new Subject<{branchId: number}>();

  startConnection(token: string) {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/stock`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('StockUpdated', (data) => {
      this.stockUpdated$.next(data);
    });

    this.connection.on('BranchProductsUpdated', (data) => {
      this.branchProductsUpdated$.next(data);
    });

    return this.connection.start();
  }

  joinBranch(branchId: number) {
    return this.connection?.invoke('JoinBranch', branchId);
  }

  leaveBranch(branchId: number) {
    return this.connection?.invoke('LeaveBranch', branchId);
  }

  stopConnection() {
    return this.connection?.stop();
  }
}
