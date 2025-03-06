import { NgModule } from '@angular/core';
import { InitialsPipe } from './initials.pipe'; // Your pipe import
import { CapitalizePipe } from './capitalize.pipe';

@NgModule({
  declarations: [InitialsPipe,CapitalizePipe],
  exports: [InitialsPipe,CapitalizePipe] 
})
export class AppPipesModule {}