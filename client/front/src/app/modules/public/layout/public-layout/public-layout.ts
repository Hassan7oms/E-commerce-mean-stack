import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminRoutingModule } from "../../../admin/admin-routing-module";
import { HeaderComponent } from '../../../../shared/components/header/header.component/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component/footer.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, AdminRoutingModule, HeaderComponent, FooterComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {

}
