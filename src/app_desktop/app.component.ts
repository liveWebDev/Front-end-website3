import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {Router} from '@angular/router';
import { URLSearchParams, } from '@angular/http';
import 'rxjs/Rx';


@Component({
  selector: 'app',
  template: '<router-outlet></router-outlet>',
  styleUrls: [ 'vendor.scss', 'index.scss' ],
  encapsulation: ViewEncapsulation.Emulated
})

export class AppComponent {
  token = '';
  email = '';
  firm_id = '';
  constructor(
      private router: Router
  )
  {
    router.events.subscribe(s => {
      let params = new URLSearchParams(s.url);
      this.token = params.rawParams.split('token=')[1];
      this.email = params.rawParams.split('&email=')[1];
      this.firm_id = params.rawParams.split('firm_id=')[1];
      if (this.email && this.token) {
        this.email = this.email.split('&firm_id=')[0];
        this.email = this.email.replace('%40', '@');
        this.token = this.token.split('&email=')[0];
      }
      if (this.token && this.email && this.firm_id) {
        localStorage.setItem('invite', JSON.stringify({ token: this.token, email: this.email, firm_id: this.firm_id }));
      }
    });

  }
}
