import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StorageKeys, getAll, save, update, remove } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TaxonomySelect } from '@/components/TaxonomySelect';

interface Component {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
}

const ComponentItems: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [componentToDelete, setComponentToDelete] = useState<string | null>(null);
  const [newComponent, setNewComponent] = useState<Partial<Component>>({
    name: '',
    category: '',
    price: 0,
    stock: 0
  });
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = () => {
    try {
      const componentsData = getAll<Component>(StorageKeys.COMPONENTS) || [];
      setComponents(componentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading components:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca componentele',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditDialogOpen && editingComponent) {
      setEditingComponent({
        ...editingComponent,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    } else {
      setNewComponent({
        ...newComponent,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    if (isEditDialogOpen && editingComponent) {
      setEditingComponent({
        ...editingComponent,
        category: value
      });
    } else {
      setNewComponent({
        ...newComponent,
        category: value
      });
    }
  };

  const handleAddComponent = () => {
    setNewComponent({
      name: '',
      category: '',
      price: 0,
      stock: 0
    });
    setIsAddDialogOpen(true);
  };

  const handleEditComponent = (id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      setEditingComponent(component);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteComponent = (id: string) => {
    setComponentToDelete(id);
  };

  const confirmDelete = () => {
    if (componentToDelete) {
      try {
        const success = remove(StorageKeys.COMPONENTS, componentToDelete);
        if (success) {
          toast({
            title: 'Succes',
            description: 'Componenta a fost ștearsă cu succes'
          });
          loadComponents();
        } else {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge componenta',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting component:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge componenta',
          variant: 'destructive'
        });
      }
      setComponentToDelete(null);
    }
  };

  const saveNewComponent = () => {
    if (!newComponent.name || !newComponent.category || newComponent.price === undefined) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      const componentToSave = {
        ...newComponent,
        id: `comp_${Date.now()}`
      } as Component;

      save(StorageKeys.COMPONENTS, componentToSave);
      toast({
        title: 'Succes',
        description: 'Componenta a fost adăugată cu succes'
      });
      setIsAddDialogOpen(false);
      loadComponents();
    } catch (error) {
      console.error('Error adding component:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga componenta',
        variant: 'destructive'
      });
    }
  };

  const saveEditedComponent = () => {
    if (!editingComponent || !editingComponent.name || !editingComponent.category) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      update(StorageKeys.COMPONENTS, editingComponent.id, editingComponent);
      toast({
        title: 'Succes',
        description: 'Componenta a fost actualizată cu succes'
      });
      setIsEditDialogOpen(false);
      loadComponents();
    } catch (error) {
      console.error('Error updating component:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza componenta',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Componente</h1>
        <Button onClick={handleAddComponent} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adaugă Componentă
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead>Stoc</TableHead>
                <TableHead className="w-28">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nu există componente definite
                  </TableCell>
                </TableRow>
              ) : (
                components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>{component.category}</TableCell>
                    <TableCell>{component.price} RON</TableCell>
                    <TableCell>{component.stock || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditComponent(component.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pentru adăugare componentă nouă */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Componentă</DialogTitle>
            <DialogDescription>
              Completați detaliile pentru noua componentă
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                name="name"
                value={newComponent.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categorie</Label>
              <TaxonomySelect
                type="componentCategories"
                value={newComponent.category || ''}
                onChange={handleCategoryChange}
                placeholder="Selectează categoria"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preț (RON)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newComponent.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Stoc</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={newComponent.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={saveNewComponent}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editare componentă */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editează Componenta</DialogTitle>
            <DialogDescription>
              Modificați detaliile componentei
            </DialogDescription>
          </DialogHeader>
          {editingComponent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nume</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingComponent.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categorie</Label>
                <TaxonomySelect
                  type="componentCategories"
                  value={editingComponent.category}
                  onChange={handleCategoryChange}
                  placeholder="Selectează categoria"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Preț (RON)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={editingComponent.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stoc</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  value={editingComponent.stock || 0}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={saveEditedComponent}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmare ștergere */}
      <AlertDialog open={componentToDelete !== null} onOpenChange={() => setComponentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți această componentă? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulare</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ComponentItems;
