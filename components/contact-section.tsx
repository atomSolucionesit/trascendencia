"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function ContactSection() {
  const { toast } = useToast()
  const [formValues, setFormValues] = useState({ nombre: "", email: "", mensaje: "" })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    toast({
      title: "Mensaje enviado",
      description: "Gracias por escribirnos. Te responderemos a la brevedad.",
    })
    setFormValues({ nombre: "", email: "", mensaje: "" })
  }

  return (
    <section id="contacto" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-[0.4em] text-muted-foreground uppercase">Contacto</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-balance">
              Creamos experiencias a tu medida
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Coordinemos una cita personalizada para encontrar la pieza perfecta o diseñar una exclusiva para vos.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-sm text-foreground">Dirección</p>
                <p className="text-sm text-muted-foreground">Colón 1248, Paso de los Libres, Corrientes</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Horario</p>
                <p className="text-sm text-muted-foreground">Lunes a sábado · 9:00 a 12:30 / 17:30 a 21:00</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Teléfono</p>
                <a className="text-sm text-secondary-foreground underline-offset-4 hover:underline" href="tel:+543772449820">
                  +54 377 244 9820
                </a>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Correo</p>
                <a
                  className="text-sm text-secondary-foreground underline-offset-4 hover:underline"
                  href="mailto:trascendenciatienda@gmail.com"
                >
                  trascendenciatienda@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/40 p-6 sm:p-8 lg:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <Input
                  name="nombre"
                  value={formValues.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  required
                  className="h-12 bg-background"
                />
                <Input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  required
                  className="h-12 bg-background"
                />
              </div>
              <Textarea
                name="mensaje"
                value={formValues.mensaje}
                onChange={handleChange}
                placeholder="Contanos qué estás buscando"
                required
                className="min-h-[160px] bg-background"
              />
              <Button type="submit" size="lg" className="text-sm tracking-wide">
                Agendar una cita
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}


