import type { ImageMetadata } from 'astro';
import cover from '../assets/goldnat.webp';
import sannaCover from '../assets/mlyn.webp';
import sannaHomepage from '../assets/sanna/sanna-home-desktop.jpg';
import sannaRoom from '../assets/sanna/sanna-room-desktop.jpg';
import sanityRoomEditor from '../assets/sanna/sanity-room-editor.png';
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
  /** Optional editorial line breaks for long project names. */
  titleLines?: string[];
  description: string;
  url: string;
  cover: ImageMetadata;
  coverAlt: string;
  /** CSS object-position for the photographic cover only. */
  coverPosition?: string;
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

/** Supplied English copy: portfolio.md, Młyn nad Sanną, 13 November 2026. */
export const mlynNadSanna: CaseStudy = {
  id: 'mlyn-nad-sanna',
  title: 'Młyn nad Sanną',
  titleLines: ['Młyn nad', 'Sanną'],
  subtitle: "From a designer's concept to a working hospitality website.",
  description: "How I developed Młyn nad Sanną's responsive website from a graphic designer's design, with Sanity CMS, integrations, deployment and client handover.",
  url: 'https://mlynnadsanna.pl/',
  cover: sannaCover,
  coverAlt: 'Autumn trees reflected in the Sanna river, from the Młyn nad Sanną website.',
  coverPosition: 'center 55%',
  contributions: ['Development from supplied design', 'Responsive layouts and interactions', 'Sanity CMS', 'Integrations', 'Deployment and handover'],
  technologies: ['TypeScript', 'React', 'Next.js', 'Sanity', 'SCSS Modules'],
  sections: [
    {
      id: 'context',
      title: 'Bringing the design to the web',
      paragraphs: [
        'Młyn nad Sanną is a guesthouse in Zaklików, Poland. The website introduces the property, presents its rooms and apartments, and gives guests a direct way to enquire about a stay.',
        'The visual design was supplied by a graphic designer. I was responsible for turning it into a responsive website, implementing its interactions and connecting the interface to editable content and external services.',
      ],
      figures: [{
        image: sannaHomepage,
        alt: "Młyn nad Sanną homepage showing the designer's typography, river photography and navigation.",
        caption: "The supplied visual concept brought to the web: typography, river photography and navigation on the homepage.",
      }],
    },
    {
      id: 'across-pages',
      title: 'A consistent experience across pages',
      paragraphs: [
        'I implemented the homepage, room listings, individual room pages and supporting information about the property. The room pages bring together photography, capacity, amenities and pricing, while galleries and the contact form help visitors explore the property and ask questions.',
        'The implementation carries the supplied typography, colours and visual details across desktop and mobile layouts. My contribution was the development and behaviour of the site; the visual concept belongs to the designer.',
      ],
      figures: [{
        image: sannaRoom,
        alt: 'Młyn nad Sanną apartment detail showing guest capacity, the apartment name, nightly pricing, a room photograph and amenities.',
        caption: 'Room information combines guest capacity, amenities and pricing within the supplied visual style.',
      }],
    },
    {
      id: 'content-management',
      title: 'Content the client can manage',
      paragraphs: [
        'I integrated Sanity CMS so room listings, photos and website content can be maintained through an editing interface. The content model separates rooms from shared information, allowing the same room data to support listings and detail pages.',
        'I also implemented the contact form and email confirmations, integrated the Instagram feed, and set up page metadata and structured data. The site supports direct enquiries; it is not a booking engine or a room-availability management system.',
      ],
      figures: [{
        image: sanityRoomEditor,
        alt: 'Sanity CMS room editor with controls for website visibility, the room name, homepage carousel inclusion and the room card title.',
        caption: 'Editing a room in Sanity: its name, website visibility and presentation in room listings and the homepage carousel.',
      }],
    },
    {
      id: 'delivered',
      title: 'Launch and handover',
      paragraphs: [
        "I deployed the website and transferred the repository, hosting and CMS to the client's accounts. The handover included moving content and media, connecting the domain and configuring the integrations in their new environment.",
        "The result is a live website based on the designer's work, with an editing interface and infrastructure owned by the client.",
      ],
    },
  ],
};
