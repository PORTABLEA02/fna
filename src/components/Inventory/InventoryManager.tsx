import React, { useState } from 'react';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { StockMovementForm } from './StockMovementForm';
import { InventoryStats } from './InventoryStats';
import { MedicineService } from '../../services/medicines';
import { Database } from '../../lib/database.types';

type Medicine = Database['public']['Tables']['medicines']['Row'];
type StockMovement = Database['public']['Tables']['stock_movements']['Row'];

export function InventoryManager() {
  const [activeView, setActiveView] = useState<'list' | 'stats'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Medicine | null>(null);

  const handleSelectProduct = (product: Medicine) => {
    setSelectedProduct(product);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Medicine) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleStockMovement = (product: Medicine) => {
    setSelectedProduct(product);
    setShowStockForm(true);
  };

  const handleSaveProduct = (productData: Partial<Medicine>) => {
    const saveProduct = async () => {
      try {
        if (editingProduct) {
          await MedicineService.update(editingProduct.id, productData);
        } else {
          await MedicineService.create(productData as any);
        }
        setShowProductForm(false);
        setEditingProduct(null);
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Erreur lors de la sauvegarde du produit');
      }
    };
    saveProduct();
  };

  const handleSaveStockMovement = (movementData: Partial<StockMovement>) => {
    const saveMovement = async () => {
      try {
        await MedicineService.addStockMovement(movementData as any);
        setShowStockForm(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Error saving stock movement:', error);
        alert('Erreur lors de la sauvegarde du mouvement de stock');
      }
    };
    saveMovement();
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleCloseStockForm = () => {
    setShowStockForm(false);
    setSelectedProduct(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return (
          <ProductList
            onSelectProduct={handleSelectProduct}
            onNewProduct={handleNewProduct}
            onEditProduct={handleEditProduct}
            onStockMovement={handleStockMovement}
          />
        );
      case 'stats':
        return <InventoryStats />;
      default:
        return (
          <ProductList
            onSelectProduct={handleSelectProduct}
            onNewProduct={handleNewProduct}
            onEditProduct={handleEditProduct}
            onStockMovement={handleStockMovement}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveView('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventaire
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingProduct || undefined}
          onClose={handleCloseProductForm}
          onSave={handleSaveProduct}
        />
      )}

      {showStockForm && selectedProduct && (
        <StockMovementForm
          product={selectedProduct}
          onClose={handleCloseStockForm}
          onSave={handleSaveStockMovement}
        />
      )}
    </div>
  );
}