import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryComponent } from './gallery.component';

@NgModule({
  imports: [CommonModule, GalleryRoutingModule, GalleryComponent],
})
export class GalleryModule {}
