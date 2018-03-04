import { Component, OnInit } from '@angular/core';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';
import { ApiService } from '../shared/api.service';

@Component({
	selector: 'app-dataclasses',
	templateUrl: './dataClasses.component.html',
	styleUrls: ['./dataClasses.component.css']
})
export class DataClassesComponent implements OnInit {

	constructor(
		private api: ApiService
	) {
	}

	ngOnInit() {
	}
}
