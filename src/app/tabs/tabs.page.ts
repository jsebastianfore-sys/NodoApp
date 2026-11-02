import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mapOutline, locationOutline, businessOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule]
})
export class TabsPage implements OnInit {

  constructor() {
    addIcons({ mapOutline, locationOutline, businessOutline, personOutline });
  }

  ngOnInit() {
  }

}
