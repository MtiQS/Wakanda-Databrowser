import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';
import { NavbarModule } from './shared/navbar/navbar.module';
import { SidebarModule } from './sidebar/sidebar.module';

import { AppComponent } from './app.component';
import { DataClassesComponent } from './dataClass/dataClasses.component';
import { SingleDataClassComponent } from './dataClass/singleDataClass.component';
import { TreeComponent } from './tree/tree.component';
import { FooterComponent } from './shared/footer/footer.component';
import { Wakanda } from './wakanda.service';
import { ApiService } from './shared/';

import { InputTextModule, DropdownModule, DataListModule, GrowlModule, Message, ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { TreeModule } from 'primeng/tree';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab.component';
import { DynamicTabsDirective } from './tabs/dynamic-tabs.directive';

@NgModule({
	declarations: [
		AppComponent,
		DataClassesComponent,
		SingleDataClassComponent,
		TreeComponent,
		FooterComponent,
		SidebarComponent,
		TabsComponent,
		TabComponent,
		DynamicTabsDirective
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		HttpModule,
		NavbarModule,
		RouterModule,
		AppRoutingModule,
		DataListModule,
		GrowlModule,
		ConfirmDialogModule,
		TableModule,
		MultiSelectModule,
		ButtonModule,
		DropdownModule,
		RadioButtonModule,
		CheckboxModule,
		CalendarModule,
		TreeModule
	],
	providers: [
		ApiService,
		Wakanda,
		ConfirmationService
	],
	entryComponents: [
		TabComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
