import { Component, OnInit } from '@angular/core';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';
import { GrowlModule, Message } from 'primeng/primeng';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public msgs: Message[] = [];

  constructor(public location: Location) { }

  ngOnInit() {
  }

  isMap(path) {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.slice(1);
    if (path === titlee) {
      return false;
    }
    else {
      return true;
    }
  }

  _setGrwolMsg(params) {
    this.msgs.push({
      severity: params.severity,
      summary: params.summary,
      detail: params.detail
    });
  }
}
