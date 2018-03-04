import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { DataClassesComponent } from './dataClass/dataClasses.component';

const routes: Routes = [
    { path: 'dataClass',      component: DataClassesComponent },
    { path: '',          redirectTo: 'dataClass', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
