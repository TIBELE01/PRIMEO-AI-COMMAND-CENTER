"use client";

import { Button, Modal } from "@primeo/ui";
import { useState } from "react";

/** Démonstration interactive de la fenêtre modale. */
export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Ouvrir la modale
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Approuver la décision ?"
        description="Exemple de confirmation d'une action de niveau 2."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setOpen(false)}>Approuver</Button>
          </>
        }
      >
        La modale se ferme avec Échap, par un clic à l’extérieur ou avec le bouton de fermeture ; le
        focus reste piégé à l’intérieur tant qu’elle est ouverte.
      </Modal>
    </>
  );
}
