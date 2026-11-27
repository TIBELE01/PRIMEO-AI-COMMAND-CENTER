import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextField,
  type Tone,
} from "@primeo/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ModalDemo } from "@/components/design-system/modal-demo";

export const metadata: Metadata = { title: "Design system" };

const BRAND = [
  { name: "Bleu Primeo", value: "#0055FF", className: "bg-brand-blue" },
  { name: "Bleu interface", value: "#1056E0", className: "bg-primary-600" },
  { name: "Orange Primeo", value: "#FF6600", className: "bg-orange-500" },
  { name: "Bleu nuit", value: "#0B1B3A", className: "bg-night-900" },
];

const ROLES = [
  ["canvas", "bg-canvas"],
  ["surface", "bg-surface"],
  ["line", "bg-line"],
  ["ink", "bg-ink"],
  ["muted", "bg-muted"],
  ["brand", "bg-brand"],
  ["accent", "bg-accent"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
] as const;

const TONES: Array<[Tone, string]> = [
  ["neutral", "Brouillon"],
  ["brand", "En cours"],
  ["warning", "En attente de validation"],
  ["success", "Terminée"],
  ["danger", "Échec"],
  ["accent", "Prioritaire"],
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/** Référence vivante du design system (exemples d'affichage, sans données réelles). */
export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
          Référence
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Design system Primeo</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Couleurs, typographie et composants de l&apos;interface. Les contenus ci-dessous sont des
          exemples.
        </p>
      </header>

      <Section title="Couleurs de marque" description="Charte graphique Primeo.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <span className={`h-16 rounded-md ring-1 ring-line ${color.className}`} />
              <span className="text-sm font-medium">{color.name}</span>
              <span className="font-mono text-xs text-subtle">{color.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Rôles de couleur"
        description="Utilisés par les composants ; adaptés automatiquement au mode sombre."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ROLES.map(([name, className]) => (
            <div key={name} className="flex items-center gap-2.5">
              <span className={`h-8 w-8 shrink-0 rounded-sm ring-1 ring-line ${className}`} />
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie" description="Inter, chiffres tabulaires pour les données.">
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-semibold tracking-tight">Titre de page — 36</p>
          <p className="text-2xl font-semibold tracking-tight">Titre de section — 24</p>
          <p className="text-base font-semibold">Titre de carte — 16</p>
          <p className="text-base leading-relaxed text-muted">
            Texte courant — 16, interligne confortable.
          </p>
          <p className="text-sm text-muted">Texte secondaire — 14</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink">
            Surtitre — 12
          </p>
          <p className="tabular text-2xl font-semibold">1 284 560 € · 98,4 %</p>
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Boutons" description="Quatre variantes, trois tailles, état de chargement.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Principal</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Discret</Button>
            <Button variant="danger">Refuser</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Petit</Button>
            <Button size="lg">Grand</Button>
            <Button loading>Envoi…</Button>
            <Button disabled>Désactivé</Button>
          </div>
        </Section>

        <Section title="Badges" description="Statuts des missions, validations et priorités.">
          <div className="flex flex-wrap gap-2">
            {TONES.map(([tone, label]) => (
              <Badge key={tone} tone={tone} dot>
                {label}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Champs" description="Libellé, aide et erreur reliés au champ.">
          <TextField label="Titre de la mission" placeholder="Ex. Stratégie d'acquisition T1" />
          <TextField label="Échéance" hint="Format : JJ/MM/AAAA" />
          <TextField label="Budget" defaultValue="abc" error="Saisissez un montant valide." />
        </Section>

        <Section title="Alertes et modale" description="Messages d'état et confirmations.">
          <Alert tone="info">Une information neutre.</Alert>
          <Alert tone="success">L&apos;opération a réussi.</Alert>
          <Alert tone="warning" title="Validation requise">
            Cette action nécessite votre approbation.
          </Alert>
          <Alert tone="danger">L&apos;opération a échoué.</Alert>
          <div>
            <ModalDemo />
          </div>
        </Section>
      </div>

      <Card>
        <CardHeader
          title="Tableau"
          description="Défilement horizontal sur mobile, chiffres alignés."
          actions={<Badge tone="brand">Exemple</Badge>}
        />
        <Table caption="Exemple de tableau de missions">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Mission</TableHeaderCell>
              <TableHeaderCell>Direction</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell align="right">Avancement</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Exemple — stratégie d&apos;acquisition</TableCell>
              <TableCell className="text-muted">Commercial · Marketing</TableCell>
              <TableCell>
                <Badge tone="brand" dot>
                  En cours
                </Badge>
              </TableCell>
              <TableCell align="right">45 %</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Exemple — rapport de trésorerie</TableCell>
              <TableCell className="text-muted">Finance</TableCell>
              <TableCell>
                <Badge tone="warning" dot>
                  En attente de validation
                </Badge>
              </TableCell>
              <TableCell align="right">90 %</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <CardFooter>
          <span className="mr-auto text-xs text-subtle">État vide :</span>
        </CardFooter>
        <Table caption="Exemple de tableau vide">
          <TableBody>
            <TableEmpty columns={4}>Aucune mission pour le moment.</TableEmpty>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
