import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  listOutline, 
  statsChartOutline, 
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl:`./tabs.page.html`,
  styleUrls: [`./tabs.page.css`]
})
export class TabsPage {
  constructor() {
    addIcons({
      'home-outline': homeOutline,
      'list-outline': listOutline,
      'stats-chart-outline': statsChartOutline,
      'person-outline': personOutline
    });
  }
}
