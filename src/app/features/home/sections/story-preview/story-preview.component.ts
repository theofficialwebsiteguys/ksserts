import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { CutoutRevealDirective } from '../../../../shared/directives/cutout-reveal.directive';

@Component({
  selector: 'app-home-story-preview',
  standalone: true,
  imports: [RouterLink, RevealDirective, CutoutRevealDirective],
  templateUrl: './story-preview.component.html',
  styleUrl: './story-preview.component.scss'
})
export class StoryPreviewComponent {}
