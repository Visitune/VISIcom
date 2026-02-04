import { Contact, ContactStatus } from './types';

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    company: 'AgroSaveur S.A.',
    siret: '123 456 789 00012',
    address: '12 Zone Industrielle Nord, 69000 Lyon',
    email: 'j.dupont@agrosaveur.fr',
    phone: '+33 6 12 34 56 78',
    status: ContactStatus.PROPOSAL,
    tags: ['IFS Food', 'Training', 'Urgent'],
    lastContact: '2023-10-25T10:00:00Z',
    certificationInterest: 'IFS Food v8',
    contractValue: 15000,
    files: ['Audit_Report_2022.pdf', 'Organigramme.png'],
    proposals: [
        {
            id: 'p1',
            title: 'Accompagnement IFS v8',
            value: 15000,
            status: 'Sent',
            content: '# Proposition Commerciale\n\n## Contexte\nAgroSaveur souhaite passer la certification IFS Food v8...\n\n## Méthodologie\n1. Diagnostic Initial\n2. Formation Équipe HACCP\n3. Mise à jour documentaire\n4. Audit à blanc\n\n## Budget\nTotal: 15,000€ HT',
            createdAt: '2023-10-22T14:30:00Z'
        }
    ],
    notes: [
      { id: 'n1', author: 'Moi', date: '2023-10-20T09:00:00Z', content: 'Besoin de formation pour 15 employés sur la Food Defense.' }
    ],
    activities: [
      { id: 'a1', type: 'call', date: '2023-10-25T10:00:00Z', description: 'Discussion détails proposition. Budget approuvé.' },
      { id: 'a2', type: 'email', date: '2023-10-22T14:30:00Z', description: 'Envoi proposition initiale v1.pdf' },
      { id: 'a3', type: 'meeting', date: '2023-10-15T11:00:00Z', description: 'Réunion découverte usine.' },
    ]
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Curie',
    company: 'Laboratoire BioTest',
    siret: '987 654 321 00055',
    address: '5 Avenue des Sciences, 75005 Paris',
    email: 'm.curie@biotest.com',
    phone: '+33 1 98 76 54 32',
    status: ContactStatus.ACTIVE,
    tags: ['ISO 17025', 'Audit'],
    lastContact: '2023-10-26T16:00:00Z',
    certificationInterest: 'ISO 17025 Accréditation',
    contractValue: 25000,
    files: ['Scope_Extension_Request.docx'],
    proposals: [],
    notes: [],
    activities: [
      { id: 'a4', type: 'email', date: '2023-10-26T16:00:00Z', description: 'Contrat signé reçu.' },
    ]
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Martin',
    company: 'Logistique Froid',
    email: 'p.martin@logfroid.fr',
    phone: '+33 7 00 11 22 33',
    status: ContactStatus.LEAD,
    tags: ['BRCGS', 'Storage'],
    lastContact: '2023-09-15T09:00:00Z',
    certificationInterest: 'BRCGS Storage & Dist',
    contractValue: 8000,
    files: [],
    proposals: [],
    notes: [],
    activities: [
      { id: 'a5', type: 'call', date: '2023-09-15T09:00:00Z', description: 'Laissé message vocal.' },
    ]
  }
];
