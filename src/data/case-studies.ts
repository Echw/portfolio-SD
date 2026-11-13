import type { ImageMetadata } from 'astro';
import cover from '../assets/goldnat.webp';
import catalogue from '../assets/goldnat/goldnat-payload-catalogue.jpg';
import financing from '../assets/goldnat/goldnat-payload-financing.jpg';
import selection from '../assets/goldnat/goldnat-payload-offer-selection.jpg';
import parameters from '../assets/goldnat/goldnat-payload-parameters.jpg';

export interface CaseStudyFigure {
  image: ImageMetadata;
  alt: string;
  caption: string;
}
export interface CaseStudySection {
  id: string;
  title: string;
  paragraphs: string[];
  figures?: CaseStudyFigure[];
}
export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  cover: ImageMetadata;
  coverAlt: string;
  contributions: string[];
  technologies: string[];
  sections: CaseStudySection[];
}

/** Supplied English copy: portfolio.md, Goldnat, 13 November 2026.
 * Images are original supplied Payload captures, not generated UI.
 */
export const goldnat: CaseStudy = {
  id: 'goldnat',
  title: 'Goldnat',
  subtitle: 'A vehicle catalogue and sales tools built around the business.',
  description: "How I built Goldnat's vehicle website and customised Payload CMS for vehicle selections, private offer links and customer forms.",
  url: 'https://goldnat.pl/',
  cover,
  coverAlt: 'A black car outside a warmly lit concrete building at night, from the Goldnat website.',
  contributions: ['Full-stack development', 'Payload CMS customisation', 'Sales workflows', 'Deployment'],
  technologies: ['TypeScript', 'Next.js', 'Payload CMS', 'PostgreSQL', 'Cloudflare R2'],
  sections: [
    {
      id: 'context',
      title: 'A website connected to the sales process',
      paragraphs: [
        'Goldnat offers long-term vehicle rental with an option to buy. The project brings together a public vehicle catalogue and an admin panel for the team managing the offers.',
        'I worked with the business on the requirements and built the website, CMS integration and supporting workflows. My role covered the customer-facing interface, the structure of the data, the admin experience and deployment.',
      ],
    },
    {
      id: 'offer-terms',
      title: 'Making the offer clear',
      paragraphs: [
        'The public catalogue presents the information a customer needs before getting in touch: the vehicle, monthly payment, initial payment and number of instalments. Visitors can search and filter the catalogue, open a vehicle page and contact the team about a specific offer.',
        'I kept customer-facing offers focused on a saved set of terms. A separate calculator provides a quick reference for staff when discussing an offer.',
      ],
      figures: [{
        image: financing,
        alt: 'Payload CMS financing fields for a monthly payment, initial payment and number of instalments, with a main variant control.',
        caption: 'Saved financing terms in Payload: monthly payment, initial payment and number of instalments.',
      }],
    },
    {
      id: 'vehicle-management',
      title: 'Managing the catalogue',
      paragraphs: [
        'In the admin panel, vehicle publication, visibility and availability are separate controls, so changing one does not silently change the others.',
      ],
      figures: [
        {
          image: catalogue,
          alt: 'Goldnat vehicle list in Payload CMS with search, publication views and columns for year, mileage, fuel and transmission.',
          caption: 'The vehicle catalogue in Payload, with search and separate publication views.',
        },
        {
          image: parameters,
          alt: 'Vehicle parameter fields in Payload CMS, including fuel, body type, transmission, engine capacity, power and seats.',
          caption: 'Structured vehicle parameters maintained in the admin panel.',
        },
      ],
    },
    {
      id: 'sales-workflows',
      title: 'Adapting Payload to the team',
      paragraphs: [
        'I extended Payload CMS beyond content editing with tools for preparing vehicle selections for individual customers and sharing them through private links. I also built customer forms that the sales team can send after a conversation, with responses available in the admin panel.',
        "The workflow brings requests and their responses together, preserves response history and supports corrections through a new link. It was designed around the team's work: select relevant vehicles, share an offer and collect the information needed for the next step.",
      ],
      figures: [{
        image: selection,
        alt: 'Payload vehicle selection for a customer, showing two ordered vehicle entries and controls for adding or reordering vehicles.',
        caption: 'Preparing and ordering a vehicle selection for an individual customer.',
      }],
    },
    {
      id: 'delivered',
      title: 'Delivered',
      paragraphs: [
        'The public website and catalogue are live. The project also includes a deployed prototype of the private offer and form workflow for staff trials. This extends the site into a tool for the sales team, with customer rollout following validation of the process.',
      ],
    },
  ],
};
