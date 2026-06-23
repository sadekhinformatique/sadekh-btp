'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Crown, Eye } from 'lucide-react';
import { REGIONS, PROPERTY_TYPES, TYPE_LABELS, STATUS_LABELS, STATUS_VARIANTS, formatPrice, formatDate } from './constants';

interface Props {
  filteredProperties: any[];
  propsLoading: boolean;
  propSearch: string;
  setPropSearch: (v: string) => void;
  propTypeFilter: string;
  setPropTypeFilter: (v: string) => void;
  propStatusFilter: string;
  setPropStatusFilter: (v: string) => void;
  propRegionFilter: string;
  setPropRegionFilter: (v: string) => void;
  propDialogOpen: boolean;
  setPropDialogOpen: (v: boolean) => void;
  deletePropDialogOpen: boolean;
  setDeletePropDialogOpen: (v: boolean) => void;
  deletePropId: string | null;
  propForm: any;
  setPropForm: (v: any) => void;
  editingProp: any;
  openNewPropDialog: () => void;
  openEditPropDialog: (prop: any) => void;
  handleSaveProperty: () => void;
  handleDeleteProp: (id: string) => void;
  deleteProperty: any;
  togglePremium: any;
  createProperty: any;
  updateProperty: any;
}

export default function PropertiesTab(props: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Biens immobiliers</h1>
          <p className="text-muted-foreground">Gérez vos annonces</p>
        </div>
        <Button onClick={props.openNewPropDialog} style={{ backgroundColor: '#1B5E20' }} className="text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={props.propSearch} onChange={(e) => props.setPropSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={props.propTypeFilter} onValueChange={props.setPropTypeFilter}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.propStatusFilter} onValueChange={props.setPropStatusFilter}>
          <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.propRegionFilter} onValueChange={props.setPropRegionFilter}>
          <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les régions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {props.propsLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.filteredProperties?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bien trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    props.filteredProperties?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{p.title || '—'}</TableCell>
                        <TableCell>{TYPE_LABELS[p.type] || p.type}</TableCell>
                        <TableCell>{p.price ? formatPrice(p.price) : '—'}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[p.status] || 'outline'}>
                            {STATUS_LABELS[p.status] || p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.views || 0}</span>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => props.togglePremium.mutate({ id: p.id, premium: !p.isPremium })}>
                            {p.isPremium ? <Crown className="h-4 w-4 text-yellow-500" /> : <Crown className="h-4 w-4 text-gray-300" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => props.openEditPropDialog(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => props.handleDeleteProp(p.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={props.propDialogOpen} onOpenChange={props.setPropDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{props.editingProp ? 'Modifier le bien' : 'Ajouter un bien'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={props.propForm.type} onValueChange={(v) => props.setPropForm({ ...props.propForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={props.propForm.status} onValueChange={(v) => props.setPropForm({ ...props.propForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Titre</Label>
              <Input value={props.propForm.title} onChange={(e) => props.setPropForm({ ...props.propForm, title: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={props.propForm.description} onChange={(e) => props.setPropForm({ ...props.propForm, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Prix (FCFA)</Label>
              <Input type="number" value={props.propForm.price} onChange={(e) => props.setPropForm({ ...props.propForm, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Surface (m²)</Label>
              <Input type="number" value={props.propForm.surface} onChange={(e) => props.setPropForm({ ...props.propForm, surface: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Pièces</Label>
              <Input type="number" value={props.propForm.rooms} onChange={(e) => props.setPropForm({ ...props.propForm, rooms: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Région</Label>
              <Select value={props.propForm.region} onValueChange={(v) => props.setPropForm({ ...props.propForm, region: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={props.propForm.city} onChange={(e) => props.setPropForm({ ...props.propForm, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Quartier</Label>
              <Input value={props.propForm.quartier} onChange={(e) => props.setPropForm({ ...props.propForm, quartier: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={props.handleSaveProperty}
              style={{ backgroundColor: '#1B5E20' }}
              className="text-white hover:opacity-90"
              disabled={props.createProperty.isPending || props.updateProperty.isPending}
            >
              {props.createProperty.isPending || props.updateProperty.isPending ? 'Enregistrement...' : props.editingProp ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={props.deletePropDialogOpen} onOpenChange={props.setDeletePropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => props.deletePropId && props.deleteProperty.mutate(props.deletePropId)} disabled={props.deleteProperty.isPending}>
              {props.deleteProperty.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
