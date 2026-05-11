import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  @Input() title: string = '';
}
