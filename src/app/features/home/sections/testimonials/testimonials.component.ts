import { Component } from '@angular/core';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface Testimonial {
  quote: string;
  attribution: string;
  meta?: string;
  handle?: boolean;
  rating?: number;
  featured?: boolean;
}

/** Real customer quotes, supplied by the client — nothing paraphrased or invented. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Amazing! So delicious, didn't even taste sugar free! 10 out of 10.",
    attribution: '@simply.me.andlonly_',
    handle: true
  },
  {
    quote: 'You can feel the love it was made with on each bite ❤️',
    attribution: '@missabyarnemann',
    handle: true
  },
  {
    quote:
      "These allergy friendly baked goods are hands down the best I have had since learning I needed to eat gluten and dairy free!! On top of that Karina is the sweetest baker around!! Get some of her cookies and thank me later.",
    attribution: '5-Star Review',
    meta: 'Aug 24',
    rating: 5,
    featured: true
  },
  {
    quote: "Ksserts has to be the most delicious healthy desserts I've had in my life. #gamechanger",
    attribution: '@kasia.edwards',
    handle: true
  },
  {
    quote: "Amazing treats! Hubby didn't even know it was gluten/sugar free :)",
    attribution: '@smelowslaw',
    handle: true
  },
  {
    quote:
      "Just ate the most delicious gluten-free Oreo cookie at the Nyack Street Fair and it was to die for! I honestly could not tell it was gluten free. It was so moist, huge, and not crumbly like so many other gluten-free cookies. It was so good I had to go back for a second one! I will definitely be ordering cookies online or finding you at another market in the future. If you're gluten free, do not pass this place by — it's an absolute winner!",
    attribution: '5-Star Review',
    meta: 'Nyack Street Fair',
    rating: 5,
    featured: true
  },
  {
    quote: 'These desserts = lifestyle change. Sweets with no regrets :)',
    attribution: '@jenn_alb1',
    handle: true
  },
  {
    quote:
      "Karina's cookies and treats are absolutely delicious! I'm so happy she does gluten-free and sugar-free, which helps me stick to my diet and enjoy my sweet tooth at the same time 😋",
    attribution: 'Karina',
    meta: 'Customer Review'
  },
  {
    quote: 'The choc chip cookies are to die for. So delicious 😋',
    attribution: 'Customer Review',
    meta: 'Chocolate Chip Cookie'
  }
];

@Component({
  selector: 'app-home-testimonials',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  protected readonly testimonials = TESTIMONIALS;
  protected readonly stars = [1, 2, 3, 4, 5];
}
