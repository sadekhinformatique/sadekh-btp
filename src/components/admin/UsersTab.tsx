'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, Pencil, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  filteredUsers: any[];
  usersLoading: boolean;
  userSearch: string;
  setUserSearch: (v: string) => void;
  userDialogOpen: boolean;
  setUserDialogOpen: (v: boolean) => void;
  userForm: any;
  setUserForm: (v: any) => void;
  editingUser: any;
  openEditUserDialog: (user: any) => void;
  handleSaveUser: () => void;
  updateUser: any;
  toggleVerified: any;
  changeRole: any;
}

export default function UsersTab(props: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les comptes utilisateurs</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un utilisateur..." value={props.userSearch} onChange={(e) => props.setUserSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {props.usersLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Vérifié</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    props.filteredUsers?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.fullName || u.name || '—'}</TableCell>
                        <TableCell className="text-sm">{u.email || '—'}</TableCell>
                        <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role || 'user'}
                            onValueChange={(v) => props.changeRole.mutate({ id: u.id, role: v })}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Utilisateur</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => props.toggleVerified.mutate({ id: u.id, verified: !u.verified })}>
                            {u.verified ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{u.agencyName || u.agency || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => props.openEditUserDialog(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
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

      <Dialog open={props.userDialogOpen} onOpenChange={props.setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={props.userForm.fullName} onChange={(e) => props.setUserForm({ ...props.userForm, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={props.userForm.phone} onChange={(e) => props.setUserForm({ ...props.userForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nom de l'agence</Label>
              <Input value={props.userForm.agencyName} onChange={(e) => props.setUserForm({ ...props.userForm, agencyName: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={props.handleSaveUser}
              style={{ backgroundColor: '#1B5E20' }}
              className="text-white hover:opacity-90"
              disabled={props.updateUser.isPending}
            >
              {props.updateUser.isPending ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
