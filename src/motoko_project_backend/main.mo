import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor {

    // Product type
    public type Product = {
        id: Nat;
        name: Text;
        price: Nat;
        description: Text;
        inStock: Bool;
        category: Text;
        isDeleted: Bool;
    };

    private stable var nextProductId: Nat = 0;
    private var products = HashMap.HashMap<Nat, Product>(0, Nat.equal, Hash.hash);

    public shared query (msg) func getIdPrincipal(): async Text{
        let caller = msg.caller;
        Principal.toText(caller);
    }; 

    // Add a new product
    public shared(msg) func addProduct(name: Text, price: Nat, description: Text, category: Text) : async Nat {
        let productId = nextProductId;

        let product: Product = {
            id = productId;
            name = name;
            price = price;
            description = description;
            inStock = true;
            category = category;
            isDeleted = false;
        };
        
        products.put(productId, product);
        nextProductId += 1;
        return productId;
    };

    // Get all products
    public query func getAllProducts() : async [Product] {
        let productIter = products.vals();
        let allProducts = Iter.toArray(productIter);
        let filteredProducts = Array.filter(allProducts, func(product: Product) : Bool {
            return product.isDeleted == false;
        });
        return filteredProducts;
    };

    // Get product by ID
    public query func getProduct(id: Nat) : async ?Product {
        products.get(id);
    };

    public query func searchProductByName(name: Text) : async [Product] {
        let productIter = products.vals();
        let allProducts = Iter.toArray(productIter);
        let filteredProducts = Array.filter(allProducts, func(product: Product) : Bool {
            return product.name == name and product.isDeleted == false;
        });
        return filteredProducts;
    };

    // Update product stock status
    public shared(msg) func updateStockStatus(id: Nat, inStock: Bool) : async Bool {
        switch (products.get(id)) {
            case (null) { false };
            case (?product) {
                if (product.isDeleted) {
                    return false; 
                };
                let updatedProduct: Product = {
                    id = product.id;
                    name = product.name;
                    price = product.price;
                    description = product.description;
                    inStock = inStock;
                    category = product.category;
                    isDeleted = product.isDeleted
                };
                products.put(id, updatedProduct);
                true;
            };
        };
    };

    public shared(msg) func updateProduct(id: Nat, name: Text, price: Nat, description: Text, category: Text, inStock: Bool): async Bool {
        switch (products.get(id)) {
            case (null) { false };
            case (?product) {
                let updatedProduct: Product = {
                    id = product.id;
                    name = name;
                    price = price;
                    description = description;
                    inStock = inStock;
                    category = category;
                    isDeleted = product.isDeleted
                };
                products.put(id, updatedProduct);
                true;
            };
        };
    };

    public shared(msg) func deleteProduct(id: Nat, isDeleted: Bool): async Bool {
        switch (products.get(id)) {
            case (null) { false };
            case (?product) {
                let updatedProduct: Product = {
                    id = product.id;
                    name = product.name;
                    price = product.price;
                    description = product.description;
                    inStock = product.inStock;
                    category = product.category;                    
                    isDeleted = isDeleted;
                };
                products.put(id, updatedProduct);
                true;
            };
        };
    }; 

    public query (msg) func filterProducts(category: Text, inStock: Bool) : async [Product] {
        let productIter = products.vals();
        let allProducts = Iter.toArray(productIter);
        let filteredProducts = Array.filter(allProducts, func(product: Product) : Bool {
            let matchesCategory = category == "" or product.category == category;
            let matchesStock = product.inStock == inStock;
            return product.isDeleted == false and matchesCategory and matchesStock;
        });
        return filteredProducts;
    };
};
