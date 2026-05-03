import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment';
import { Department, Category, Product, ProductWithImage, DepartmentWithImage, Precio, ProductoImage, Etiqueta, EtiquetaProducto, EtiquetaConValor, ProductDetail } from '../models/store.models';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Cache for prices (keyed by product ID)
  private pricesCache = new Map<number, number>();
  private pricesCacheLoaded = false;

  // Cache for products by department
  private productsByDepartmentCache = new Map<number, ProductWithImage[]>();

  // USD currency ID
  private readonly USD_MONEDA_ID = 2;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Preload all USD prices into cache
  async preloadPrices(): Promise<void> {
    if (this.pricesCacheLoaded) return;

    const { data, error } = await this.supabase
      .from('precios')
      .select('id_producto, precio')
      .eq('id_moneda', this.USD_MONEDA_ID);

    if (!error && data) {
      (data as Precio[]).forEach(p => {
        this.pricesCache.set(p.id_producto, p.precio);
      });
      this.pricesCacheLoaded = true;
    }
  }

  // Get price from cache
  getPriceUSD(productId: number): number | undefined {
    return this.pricesCache.get(productId);
  }

  // Get public URL for product image (format: 'nombre -codigo')
  getProductImageUrl(product: Product): string {
    const imageName = this.parseName(product.descripcion, product.codigo);
    const { data } = this.supabase.storage
      .from(environment.bucketName)
      .getPublicUrl(imageName);
    return data.publicUrl;
  } 

  // Parse name for image name
  parseName(descripcion: string, codigo?: string | null): string {
    let finalDesc = codigo ? (descripcion + " -" + codigo) : descripcion;
    const caracteres = '<>:\"/\\|?*ÁÉÍÓÚÜÑ¨´ñ`';
    finalDesc = finalDesc.toUpperCase().split('').map(c => caracteres.includes(c) ? '_' : c).join('');
    return finalDesc.replace(/ /g, '_').toUpperCase();
  }

  // Get public URL for department image (same name as department)
  getDepartmentImageUrl(department: Department): string {
    const { data } = this.supabase.storage
      .from(environment.bucketName)
      .getPublicUrl(this.parseName(department.departamento, null));
    return data.publicUrl;
  }

  // Fetch all web-enabled departments
  async getDepartments(): Promise<DepartmentWithImage[]> {
    const { data, error } = await this.supabase
      .from('departamentos')
      .select('*')
      .eq('web', true)
      .order('departamento');

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    return (data as Department[]).map(dept => ({
      ...dept,
      imageUrl: this.getDepartmentImageUrl(dept)
    }));
  }

  // Fetch categories for a department
  async getCategoriesByDepartment(departmentId: number): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .eq('id_departamento', departmentId)
      .eq('web', true)
      .order('nombre');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as Category[];
  }

  // Fetch department by ID
  async getDepartmentById(id: number): Promise<DepartmentWithImage | null> {
    const { data, error } = await this.supabase
      .from('departamentos')
      .select('*')
      .eq('id_departamento', id)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return null;
    }

    const dept = data as Department;
    return {
      ...dept,
      imageUrl: this.getDepartmentImageUrl(dept)
    };
  }

  // Fetch category by ID
  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .eq('id_categoria', id)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data as Category;
  }

  // Fetch products by department with caching and optimized price loading
  async getProductsByDepartment(departmentId: number): Promise<ProductWithImage[]> {
    // Check cache first
    if (this.productsByDepartmentCache.has(departmentId)) {
      return this.productsByDepartmentCache.get(departmentId)!;
    }

    // Ensure prices are preloaded
    await this.preloadPrices();

    const { data, error } = await this.supabase
      .from('productos')
      .select('id_producto, descripcion, codigo, precio, id_departamento, id_categoria, activo, web')
      .eq('id_departamento', departmentId)
      .eq('activo', true)
      // .eq('web', true)
      .order('descripcion');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    const products = (data as Product[]).map(product => ({
      ...product,
      imageUrl: this.getProductImageUrl(product),
      precioUSD: this.getPriceUSD(product.id_producto)
    }));

    // Cache the results
    this.productsByDepartmentCache.set(departmentId, products);

    return products;
  }

  // Fetch products by category with optimized price loading
  async getProductsByCategory(categoryId: number): Promise<ProductWithImage[]> {
    // Ensure prices are preloaded
    await this.preloadPrices();

    const { data, error } = await this.supabase
      .from('productos')
      .select('id_producto, descripcion, codigo, precio, id_departamento, id_categoria, activo, web')
      .eq('id_categoria', categoryId)
      .eq('activo', true)
      // .eq('web', true)
      .order('descripcion');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data as Product[]).map(product => ({
      ...product,
      imageUrl: this.getProductImageUrl(product),
      precioUSD: this.getPriceUSD(product.id_producto)
    }));
  }

  // Search products across all departments and categories
  async searchProducts(query: string): Promise<ProductWithImage[]> {
    // Ensure prices are preloaded
    await this.preloadPrices();

    const { data, error } = await this.supabase
      .from('productos')
      .select('id_producto, descripcion, codigo, precio, id_departamento, id_categoria, activo, web')
      .eq('activo', true)
      // .eq('web', true)
      .or(`descripcion.ilike.%${query}%,codigo.ilike.%${query}%`)
      .order('descripcion')
      .limit(50);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data as Product[]).map(product => ({
      ...product,
      imageUrl: this.getProductImageUrl(product),
      precioUSD: this.getPriceUSD(product.id_producto)
    }));
  }

  // Clear caches (useful for refresh)
  clearCache(): void {
    this.productsByDepartmentCache.clear();
    this.pricesCache.clear();
    this.pricesCacheLoaded = false;
  }

  // Get image URL from productos_images table
  getImageUrlFromName(imageName: string): string {
    const { data } = this.supabase.storage
      .from(environment.bucketName)
      .getPublicUrl(imageName);
    return data.publicUrl;
  }

  // Fetch product images from productos_images table
  async getProductImages(productId: number): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('productos_images')
      .select('nombre_image')
      .eq('id_producto', productId);

    if (error || !data) {
      console.error('Error fetching product images:', error);
      return [];
    }

    return (data as ProductoImage[]).map(img => this.getImageUrlFromName(img.nombre_image));
  }

  // Fetch product etiquetas (only ficha_tecnica = true)
  async getProductEtiquetas(productId: number): Promise<EtiquetaConValor[]> {
    const { data: relacionData, error: relacionError } = await this.supabase
      .from('etiquetas_productos')
      .select('id_etiqueta, valor')
      .eq('id_producto', productId);

    if (relacionError || !relacionData || relacionData.length === 0) {
      return [];
    }

    const etiquetaIds = (relacionData as EtiquetaProducto[]).map(r => r.id_etiqueta);

    const { data: etiquetasData, error: etiquetasError } = await this.supabase
      .from('etiquetas')
      .select('id_etiqueta, nombre, ficha_tecnica')
      .in('id_etiqueta', etiquetaIds)
      .eq('ficha_tecnica', true);

    if (etiquetasError || !etiquetasData) {
      return [];
    }

    const etiquetasMap = new Map((etiquetasData as Etiqueta[]).map(e => [e.id_etiqueta, e]));

    return (relacionData as EtiquetaProducto[])
      .filter(r => etiquetasMap.has(r.id_etiqueta))
      .map(r => ({
        ...etiquetasMap.get(r.id_etiqueta)!,
        valor: r.valor
      }));
  }

  // Fetch product by ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('id_producto', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as Product;
  }

  // Fetch complete product detail
  async getProductDetail(productId: number): Promise<ProductDetail | null> {
    await this.preloadPrices();

    const [product, images, etiquetas] = await Promise.all([
      this.getProductById(productId),
      this.getProductImages(productId),
      this.getProductEtiquetas(productId)
    ]);

    if (!product) return null;

    const [department, category] = await Promise.all([
      this.getDepartmentById(product.id_departamento),
      product.id_categoria ? this.getCategoryById(product.id_categoria) : Promise.resolve(null)
    ]);

    return {
      ...product,
      imageUrl: this.getProductImageUrl(product),
      precioUSD: this.getPriceUSD(productId),
      images: images,
      etiquetas,
      department: department!,
      category: category || undefined
    };
  }
}
