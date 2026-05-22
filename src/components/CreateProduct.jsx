import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaTrash,
  FaCopy,
  FaCloudUploadAlt,
  FaArrowLeft,
  FaTag,
  FaLayerGroup,
  FaMagic,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaImage,
  FaSearch,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProduct = ({ editData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [globalAttributes, setGlobalAttributes] = useState([]);

  // Store fetched GST and Tags
  const [gstRates, setGstRates] = useState({ SGST: [], CGST: [] });
  const [tagsList, setTagsList] = useState([]); // NEW TAGS STATE

  const [product, setProduct] = useState({
    title: "",
    description: "",
    brand: "",
    category: "",
    subcategory: "",
    vendor: "",
    status: "Active",
  });

  const [globalImages, setGlobalImages] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const [productAttributes, setProductAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [defaultVariantIndex, setDefaultVariantIndex] = useState(0);

  const [openVariantIndex, setOpenVariantIndex] = useState(0);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [showAttrDropdown, setShowAttrDropdown] = useState(false);
  const attrSearchRef = useRef(null);

  // NEW: State to hold copied images for pasting across variants
  const [copiedImages, setCopiedImages] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, attrRes, gstRes, tagRes] = await Promise.all([
          axios.get("http://localhost:5000/api/category/all"),
          axios.get("http://localhost:5000/api/brands"),
          axios.get("http://localhost:5000/api/attributes"),
          axios.get("http://localhost:5000/api/gst"),
          axios
            .get("http://localhost:5000/api/tags")
            .catch(() => ({ data: [] })), // Safe fetch for Tags
        ]);
        setCategoriesList(catRes.data);
        setBrandsList(brandRes.data);
        setGlobalAttributes(attrRes.data);
        setTagsList(tagRes.data); // Set Tags

        // Map and set SGST and CGST
        const gstData = gstRes.data.data || gstRes.data;
        const sgstList = gstData.filter((g) => g.taxType === "SGST");
        const cgstList = gstData.filter((g) => g.taxType === "CGST");
        setGstRates({ SGST: sgstList, CGST: cgstList });

        if (editData) {
          setProduct({
            title: editData.title || "",
            description: editData.description || "",
            brand: editData.brand || "",
            category: editData.category || "",
            subcategory: editData.subcategory || "",
            vendor: editData.vendor || "",
            status: editData.status || "Active",
          });

          // Load Global Images
          const loadedGlobalImages = [null, null, null, null, null];
          if (editData.thumbnail) {
            loadedGlobalImages[0] = {
              preview: `http://localhost:5000${editData.thumbnail}`,
              existingPath: editData.thumbnail,
            };
          }
          if (editData.gallery && editData.gallery.length > 0) {
            editData.gallery.forEach((gImg, idx) => {
              if (idx < 4)
                loadedGlobalImages[idx + 1] = {
                  preview: `http://localhost:5000${gImg}`,
                  existingPath: gImg,
                };
            });
          }
          setGlobalImages(loadedGlobalImages);

          const loadedAttrs = (editData.productAttributes || []).map((pa) => {
            const fullAttr = attrRes.data.find((a) => a._id === pa.attribute);
            return {
              attribute: fullAttr || { _id: pa.attribute, terms: [] },
              selectedTerms: pa.selectedTerms || [],
            };
          });
          setProductAttributes(loadedAttrs.filter((a) => a.attribute.name));

          const loadedVariants = (editData.variants || []).map((v) => {
            const mappedImages = Array(5).fill(null);
            if (v.images && v.images.length > 0) {
              v.images.forEach((imgPath, idx) => {
                if (imgPath && idx < 5) {
                  mappedImages[idx] = {
                    preview: `http://localhost:5000${imgPath}`,
                    existingPath: imgPath,
                  };
                }
              });
            }
            return {
              ...v,
              originalPrice: v.price || v.originalPrice || 0,
              sgst: v.sgst || "",
              cgst: v.cgst || "",
              tag: v.tag || "", // Ensure tag is mapped for edit
              images: mappedImages,
            };
          });
          setVariants(loadedVariants);
          const defaultIdx = loadedVariants.findIndex((v) => v.isDefault);
          setDefaultVariantIndex(defaultIdx !== -1 ? defaultIdx : 0);
        }
      } catch (err) {
        toast.error("Failed to load backend data");
      }
    };
    fetchData();
  }, [editData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attrSearchRef.current &&
        !attrSearchRef.current.contains(event.target)
      ) {
        setShowAttrDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductChange = (e) =>
    setProduct({ ...product, [e.target.name]: e.target.value });

  const availableAttributes = globalAttributes.filter(
    (attr) => !productAttributes.some((pa) => pa.attribute._id === attr._id)
  );
  const filteredAttributes = availableAttributes.filter((attr) =>
    attr.name.toLowerCase().includes(attributeSearch.toLowerCase())
  );

  const handleSelectAttribute = (attrObj) => {
    setProductAttributes([
      ...productAttributes,
      { attribute: attrObj, selectedTerms: [] },
    ]);
    setAttributeSearch("");
    setShowAttrDropdown(false);
  };

  const removeProductAttribute = (index) =>
    setProductAttributes(productAttributes.filter((_, i) => i !== index));

  const toggleTermSelection = (attrIndex, termValue) => {
    const updated = [...productAttributes];
    const currentSelected = updated[attrIndex].selectedTerms;
    if (currentSelected.includes(termValue))
      updated[attrIndex].selectedTerms = currentSelected.filter(
        (v) => v !== termValue
      );
    else updated[attrIndex].selectedTerms.push(termValue);
    setProductAttributes(updated);
  };

  const handleSelectAll = (attrIndex) => {
    const updated = [...productAttributes];
    updated[attrIndex].selectedTerms = updated[attrIndex].attribute.terms.map(
      (t) => t.value
    );
    setProductAttributes(updated);
  };

  const handleClearAll = (attrIndex) => {
    const updated = [...productAttributes];
    updated[attrIndex].selectedTerms = [];
    setProductAttributes(updated);
  };

  const handleGlobalImageUpload = (slotIndex, file) => {
    const updated = [...globalImages];
    updated[slotIndex] = { file, preview: URL.createObjectURL(file) };
    setGlobalImages(updated);
  };

  const removeGlobalImage = (slotIndex) => {
    const updated = [...globalImages];
    updated[slotIndex] = null;
    setGlobalImages(updated);
  };

  const handleVariantImageUpload = (vIndex, slotIndex, file) => {
    const updated = [...variants];
    updated[vIndex].images[slotIndex] = {
      file,
      preview: URL.createObjectURL(file),
    };
    setVariants(updated);
  };

  const removeVariantImage = (vIndex, slotIndex) => {
    const updated = [...variants];
    updated[vIndex].images[slotIndex] = null;
    setVariants(updated);
  };

  // NEW: Copy images from a specific variant
  const copyVariantImages = (vIndex) => {
    setCopiedImages([...variants[vIndex].images]);
    toast.info("Images copied! You can now paste them in another variation.");
  };

  // NEW: Paste images to a specific variant
  const pasteVariantImages = (vIndex) => {
    if (!copiedImages) {
      return toast.warn("No images copied yet!");
    }
    const updated = [...variants];
    updated[vIndex].images = [...copiedImages];
    setVariants(updated);
    toast.success("Images pasted successfully!");
  };

  const generateVariations = () => {
    const activeAttrs = productAttributes.filter(
      (pa) => pa.selectedTerms.length > 0
    );
    if (activeAttrs.length === 0)
      return toast.warn(
        "Please select at least one attribute term before generating."
      );

    const combine = (index, currentCombo) => {
      if (index === activeAttrs.length) {
        return [
          {
            title: "",
            sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            originalPrice: "",
            discountPrice: "",
            stock: "",
            sgst: "",
            cgst: "",
            tag: "", // Default tag is empty
            attributes: currentCombo,
            images: [null, null, null, null, null],
          },
        ];
      }

      let results = [];
      const attrBlock = activeAttrs[index];

      attrBlock.selectedTerms.forEach((termVal) => {
        const termObj = attrBlock.attribute.terms.find(
          (t) => t.value === termVal
        );
        const termLabel = termObj ? termObj.name || termObj.label : termVal;

        const isColor =
          attrBlock.attribute.type === "COLOR" ||
          attrBlock.attribute.name.toLowerCase() === "color";
        const hexVal = termObj
          ? termObj.colorCode || termObj.color || termObj.value || termObj.hex
          : termVal;

        results = results.concat(
          combine(index + 1, [
            ...currentCombo,
            {
              name: attrBlock.attribute.name,
              value: termLabel,
              isColor: isColor,
              hex: hexVal,
            },
          ])
        );
      });
      return results;
    };

    const newVariants = combine(0, []).map((v, idx) => ({
      ...v,
      title: `Variation ${idx + 1}`,
    }));
    setVariants(newVariants);
    setDefaultVariantIndex(0);
    setOpenVariantIndex(0);
    toast.success(`Generated ${newVariants.length} Variations!`);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (i) => {
    setVariants(variants.filter((_, idx) => idx !== i));
    if (defaultVariantIndex === i) setDefaultVariantIndex(0);
    if (openVariantIndex === i) setOpenVariantIndex(null);
  };

  const duplicateVariant = (i) => {
    const copy = {
      ...variants[i],
      title: `${variants[i].title} (Copy)`,
      sku: `SKU-${Date.now()}`,
    };
    copy.images = copy.images.map((img) => (img ? { ...img } : null));
    setVariants([...variants, copy]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0)
      return toast.warn(
        "Please generate at least one variation before saving."
      );
    setLoading(true);

    const formData = new FormData();
    Object.keys(product).forEach((k) => formData.append(k, product[k]));

    // Append Global Images
    globalImages.forEach((img, idx) => {
      if (img?.file) {
        if (idx === 0) formData.append("thumbnail", img.file);
        else formData.append("gallery", img.file);
      }
    });

    const formattedProductAttrs = productAttributes.map((pa) => ({
      attribute: pa.attribute._id,
      selectedTerms: pa.selectedTerms,
    }));
    formData.append("productAttributes", JSON.stringify(formattedProductAttrs));

    const variantsMeta = variants.map((v, vIdx) => {
      const existingImages = [];
      v.images.forEach((slot, sIdx) => {
        if (slot?.file) formData.append(`image_${vIdx}_${sIdx}`, slot.file);
        else if (slot?.existingPath) existingImages.push(slot.existingPath);
      });
      return {
        title: v.title,
        sku: v.sku,
        originalPrice: v.originalPrice,
        discountPrice: v.discountPrice,
        stock: v.stock,
        sgst: v.sgst,
        cgst: v.cgst,
        tag: v.tag, // Sending tag data to backend
        attributes: v.attributes,
        isDefault: vIdx === defaultVariantIndex,
        existingImages: existingImages,
      };
    });
    formData.append("variants", JSON.stringify(variantsMeta));

    try {
      if (editData && editData._id) {
        await axios.put(
          `http://localhost:5000/api/products/update/${editData._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Product Updated Successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/products/create",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Product Created Successfully!");
      }
      setTimeout(onSuccess, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "#334155",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "30px",
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: "20px",
    },
    backBtn: {
      padding: "10px",
      borderRadius: "50%",
      border: "1px solid #cbd5e1",
      background: "white",
      cursor: "pointer",
    },
    title: { fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 },
    section: {
      background: "white",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      padding: "25px",
      marginBottom: "20px",
    },
    sectionHeader: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#0f172a",
    },
    inputGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px",
    },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
      background: "#f8fafc",
      width: "100%",
      boxSizing: "border-box",
    },
    variantCard: {
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      background: "#fff",
      marginBottom: "15px",
      overflow: "hidden",
    },
    variantTop: {
      background: "#f8fafc",
      padding: "12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e2e8f0",
      cursor: "pointer",
      userSelect: "none",
    },
    submitBtn: {
      width: "100%",
      padding: "18px",
      borderRadius: "8px",
      background: "var(--mern-admin-primary)",
      color: "white",
      fontSize: "16px",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
    },
    imgUploadBox: {
      border: "2px dashed #cbd5e1",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      background: "#f8fafc",
      position: "relative",
      overflow: "hidden",
    },
  };

  const subcategories =
    categoriesList.find((c) => c._id === product.category)?.subcategories || [];

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .responsive-wrapper { padding: 10px !important; }
            .responsive-section { padding: 15px !important; }
            
            /* General form elements stack to 1 column */
            .responsive-grid-2 { grid-template-columns: 1fr !important; }
            
            /* 4-column grids drop to 2 on tablets, and 1 on small phones */
            .responsive-grid-4 { 
              grid-template-columns: 1fr 1fr !important; 
              gap: 15px !important; 
            }
            
            /* Images wrap gracefully into rows instead of squishing */
            .responsive-img-grid { 
              grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important; 
              gap: 10px !important;
            }
            
            /* Accordion Headers stack cleanly */
            .responsive-variant-top {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            .responsive-variant-actions {
              width: 100% !important;
              justify-content: flex-start !important;
              gap: 15px !important;
              flex-wrap: wrap !important;
              margin-top: 8px !important;
            }
          }

          @media (max-width: 480px) {
            /* Force smallest screens to purely 1 column for input grids */
            .responsive-grid-4 { grid-template-columns: 1fr !important; }
            .responsive-variant-actions { justify-content: space-between !important; }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" />
        <div style={s.header}>
          <button type="button" onClick={onCancel} style={s.backBtn}>
            <FaArrowLeft />
          </button>
          <div>
            <h2 style={s.title}>
              {editData && editData._id ? "Edit Product" : "Create Product"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.section} className="responsive-section">
            <div style={s.sectionHeader}>
              <FaTag color="var(--mern-admin-primary)" /> 1. General Info
            </div>
            <div style={s.inputGrid} className="responsive-grid-2">
              <div style={s.inputGroup}>
                <label style={s.label}>Product Title</label>
                <input
                  style={s.input}
                  name="title"
                  value={product.title}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Brand</label>
                <select
                  style={s.input}
                  name="brand"
                  value={product.brand}
                  onChange={handleProductChange}
                >
                  <option value="">Select Brand</option>
                  {brandsList.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name || b.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Category</label>
                <select
                  style={s.input}
                  name="category"
                  value={product.category}
                  onChange={handleProductChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Subcategory</label>
                <select
                  style={s.input}
                  name="subcategory"
                  value={product.subcategory}
                  onChange={handleProductChange}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Vendor</label>
                <input
                  style={s.input}
                  name="vendor"
                  value={product.vendor}
                  onChange={handleProductChange}
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  name="status"
                  value={product.status}
                  onChange={handleProductChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Global Description</label>
              <textarea
                style={{ ...s.input, height: "80px", resize: "none" }}
                name="description"
                value={product.description}
                onChange={handleProductChange}
              />
            </div>
          </div>

          {/* DEFAULT IMAGES SECTION */}
          <div style={s.section} className="responsive-section">
            <div style={s.sectionHeader}>
              <FaImage color="var(--mern-admin-primary)" /> 2. Default Product
              Images
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "15px",
              }}
            >
              These 5 images will be used as the global product images. They
              will act as a fallback if no specific variation images are
              uploaded.
            </p>
            <div
              className="responsive-img-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "15px",
              }}
            >
              {globalImages.map((slot, sIdx) => (
                <div key={sIdx} style={{ ...s.imgUploadBox, height: "140px" }}>
                  {slot ? (
                    <>
                      <img
                        src={slot.preview}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt="prev"
                      />
                      <button
                        type="button"
                        onClick={() => removeGlobalImage(sIdx)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "white",
                          color: "var(--mern-admin-primary)",
                          border: "1px solid var(--mern-admin-primary)",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        X
                      </button>
                    </>
                  ) : (
                    <label
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "#94a3b8",
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <FaCloudUploadAlt size={24} />
                      <span style={{ fontSize: "12px", marginTop: "5px" }}>
                        {sIdx === 0 ? "Thumbnail" : "Gallery"}
                      </span>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files[0] &&
                          handleGlobalImageUpload(sIdx, e.target.files[0])
                        }
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={s.section} className="responsive-section">
            <div style={s.sectionHeader}>
              <FaLayerGroup color="var(--mern-admin-primary)" /> 3. Define
              Attributes
            </div>

            <div
              style={{ position: "relative", marginBottom: "20px" }}
              ref={attrSearchRef}
            >
              <FaSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "14px",
                  color: "#64748b",
                }}
              />
              <input
                style={{ ...s.input, paddingLeft: "35px" }}
                placeholder="Search and add attributes (e.g., Size, Color)..."
                value={attributeSearch}
                onChange={(e) => {
                  setAttributeSearch(e.target.value);
                  setShowAttrDropdown(true);
                }}
                onFocus={() => setShowAttrDropdown(true)}
              />
              {showAttrDropdown && filteredAttributes.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "105%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 50,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {filteredAttributes.map((attr) => (
                    <div
                      key={attr._id}
                      onClick={() => handleSelectAttribute(attr)}
                      style={{
                        padding: "12px 15px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      {attr.name}
                    </div>
                  ))}
                </div>
              )}
              {showAttrDropdown &&
                filteredAttributes.length === 0 &&
                availableAttributes.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "105%",
                      left: 0,
                      right: 0,
                      background: "white",
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      zIndex: 50,
                      fontSize: "14px",
                      color: "#94a3b8",
                    }}
                  >
                    No more attributes available.
                  </div>
                )}
            </div>

            {productAttributes.map((pa, attrIdx) => {
              const isColorAttr =
                pa.attribute.type === "COLOR" ||
                pa.attribute.name.toLowerCase() === "color";

              return (
                <div
                  key={pa.attribute._id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "15px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <strong
                      style={{ fontSize: "16px", textTransform: "capitalize" }}
                    >
                      {pa.attribute.name}
                    </strong>
                    <button
                      type="button"
                      onClick={() => removeProductAttribute(attrIdx)}
                      style={{
                        color: "var(--mern-admin-primary)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {pa.attribute.terms.map((term) => {
                      const hexVal =
                        term.colorCode || term.color || term.value || term.hex;

                      return (
                        <label
                          key={term.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "white",
                            padding: "8px 16px",
                            border: pa.selectedTerms.includes(term.value)
                              ? "2px solid #3b82f6"
                              : "1px solid #cbd5e1",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={pa.selectedTerms.includes(term.value)}
                            onChange={() =>
                              toggleTermSelection(attrIdx, term.value)
                            }
                            style={{
                              accentColor: "#3b82f6",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                          />

                          {isColorAttr && (
                            <span
                              style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: hexVal || "#ccc",
                                border: "1px solid #cbd5e1",
                                display: "inline-block",
                              }}
                            ></span>
                          )}

                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#334155",
                            }}
                          >
                            {term.name || term.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div
                    style={{ marginTop: "15px", display: "flex", gap: "10px" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectAll(attrIdx)}
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAll(attrIdx)}
                      style={{
                        background: "#fff",
                        color: "var(--mern-admin-primary)",
                        border: "1px solid #fee2e2",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Select None
                    </button>
                  </div>
                </div>
              );
            })}

            {productAttributes.length > 0 && (
              <button
                type="button"
                onClick={generateVariations}
                style={{
                  background: "#ededed",
                  color: "#0f172a",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "700",
                  marginTop: "10px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <FaMagic /> Generate Variations from Selected Terms
              </button>
            )}
          </div>

          {variants.length > 0 && (
            <div
              style={{
                ...s.section,
                background: "transparent",
                border: "none",
                padding: 0,
              }}
              className="responsive-section"
            >
              <div style={s.sectionHeader}>
                4. Edit Variations ({variants.length})
              </div>

              {variants.map((v, i) => {
                const isAccordionOpen = openVariantIndex === i;
                const stockVal = Number(v.stock);
                const isLowStock = v.stock === "" || stockVal < 3;

                return (
                  <div
                    key={i}
                    style={{
                      ...s.variantCard,
                      border:
                        defaultVariantIndex === i
                          ? "2px solid #10b981"
                          : "1px solid #cbd5e1",
                    }}
                  >
                    {/* ACCORDION HEADER */}
                    <div
                      style={s.variantTop}
                      className="responsive-variant-top"
                      onClick={() =>
                        setOpenVariantIndex(isAccordionOpen ? null : i)
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong style={{ color: "#0f172a", fontSize: "15px" }}>
                          {v.title}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {(v.attributes || []).map((attr, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "12px",
                                background: "#e2e8f0",
                                color: "#334155",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              {attr.isColor && (
                                <span
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    backgroundColor: attr.hex || "#ccc",
                                    border: "1px solid #cbd5e1",
                                    display: "inline-block",
                                  }}
                                ></span>
                              )}
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </div>

                        <span
                          style={{
                            fontSize: "12px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            color: "white",
                            fontWeight: "bold",
                            background: isLowStock
                              ? "var(--mern-admin-primary)"
                              : "#10b981",
                          }}
                        >
                          Stock: {v.stock === "" ? "N/A" : v.stock}
                        </span>
                      </div>

                      <div
                        className="responsive-variant-actions"
                        style={{
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "700",
                            color:
                              defaultVariantIndex === i ? "#10b981" : "#64748b",
                          }}
                        >
                          <input
                            type="radio"
                            checked={defaultVariantIndex === i}
                            onChange={() => setDefaultVariantIndex(i)}
                            style={{
                              accentColor: "#10b981",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                          />
                          {defaultVariantIndex === i ? (
                            <>
                              <FaStar /> DEFAULT
                            </>
                          ) : (
                            "Set Default"
                          )}
                        </label>

                        <button
                          type="button"
                          onClick={() => duplicateVariant(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <FaCopy /> Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--mern-admin-primary)",
                            cursor: "pointer",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <FaTrash /> Remove
                        </button>
                        <div
                          style={{
                            marginLeft: "10px",
                            color: "#64748b",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setOpenVariantIndex(isAccordionOpen ? null : i)
                          }
                        >
                          {isAccordionOpen ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACCORDION BODY */}
                    {isAccordionOpen && (
                      <div
                        style={{
                          padding: "20px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          className="responsive-grid-4"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            gap: "15px",
                            marginBottom: "15px",
                          }}
                        >
                          <div style={s.inputGroup}>
                            <label style={s.label}>SKU</label>
                            <input
                              style={s.input}
                              value={v.sku}
                              onChange={(e) =>
                                handleVariantChange(i, "sku", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Price (₹)</label>
                            <input
                              style={s.input}
                              type="number"
                              value={v.originalPrice}
                              onChange={(e) =>
                                handleVariantChange(
                                  i,
                                  "originalPrice",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Discount (₹)</label>
                            <input
                              style={s.input}
                              type="number"
                              value={v.discountPrice}
                              onChange={(e) =>
                                handleVariantChange(
                                  i,
                                  "discountPrice",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Stock</label>
                            <input
                              style={s.input}
                              type="number"
                              value={v.stock}
                              onChange={(e) =>
                                handleVariantChange(i, "stock", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        {/* GST ROW & NEW TAGS ROW FOR VARIANTS */}
                        <div
                          className="responsive-grid-4"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            gap: "15px",
                            marginBottom: "15px",
                          }}
                        >
                          <div style={s.inputGroup}>
                            <label style={s.label}>SGST (%)</label>
                            <select
                              style={s.input}
                              value={v.sgst}
                              onChange={(e) =>
                                handleVariantChange(i, "sgst", e.target.value)
                              }
                            >
                              <option value="">0%</option>
                              {gstRates.SGST.map((g) => (
                                <option key={g._id} value={g.rate}>
                                  {g.rate}%
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>CGST (%)</label>
                            <select
                              style={s.input}
                              value={v.cgst}
                              onChange={(e) =>
                                handleVariantChange(i, "cgst", e.target.value)
                              }
                            >
                              <option value="">0%</option>
                              {gstRates.CGST.map((g) => (
                                <option key={g._id} value={g.rate}>
                                  {g.rate}%
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Total GST (%)</label>
                            <input
                              style={{
                                ...s.input,
                                background: "#e2e8f0",
                                color: "#64748b",
                                cursor: "not-allowed",
                              }}
                              value={Number(v.sgst || 0) + Number(v.cgst || 0)}
                              readOnly
                            />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Tag</label>
                            <select
                              style={s.input}
                              value={v.tag}
                              onChange={(e) =>
                                handleVariantChange(i, "tag", e.target.value)
                              }
                            >
                              <option value="">Select Tag</option>
                              {tagsList.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name || t.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* --- UPDATED IMAGE HEADER WITH COPY/PASTE BUTTONS --- */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <label
                            style={{
                              ...s.label,
                              display: "block",
                              marginBottom: 0,
                            }}
                          >
                            Variation Images (5 Slots)
                          </label>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              type="button"
                              onClick={() => copyVariantImages(i)}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                color: "#334155",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <FaCopy /> Copy Images
                            </button>

                            <button
                              type="button"
                              onClick={() => pasteVariantImages(i)}
                              disabled={!copiedImages}
                              style={{
                                background: copiedImages
                                  ? "#dbeafe"
                                  : "#f1f5f9",
                                color: copiedImages ? "#1d4ed8" : "#94a3b8",
                                border: "1px solid",
                                borderColor: copiedImages
                                  ? "#bfdbfe"
                                  : "#cbd5e1",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: copiedImages
                                  ? "pointer"
                                  : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              Paste Images
                            </button>
                          </div>
                        </div>
                        {/* --- END UPDATED IMAGE HEADER --- */}

                        <div
                          className="responsive-img-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: "15px",
                          }}
                        >
                          {v.images.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              style={{ ...s.imgUploadBox, height: "140px" }}
                            >
                              {slot ? (
                                <>
                                  <img
                                    src={slot.preview}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    alt="prev"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariantImage(i, sIdx)}
                                    style={{
                                      position: "absolute",
                                      top: "5px",
                                      right: "5px",
                                      background: "white",
                                      color: "var(--mern-admin-primary)",
                                      border:
                                        "1px solid var(--mern-admin-primary)",
                                      borderRadius: "50%",
                                      width: "24px",
                                      height: "24px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    X
                                  </button>
                                </>
                              ) : (
                                <label
                                  style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    color: "#94a3b8",
                                    width: "100%",
                                    height: "100%",
                                    justifyContent: "center",
                                  }}
                                >
                                  <FaCloudUploadAlt size={24} />
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      marginTop: "5px",
                                    }}
                                  >
                                    Upload
                                  </span>
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) =>
                                      e.target.files[0] &&
                                      handleVariantImageUpload(
                                        i,
                                        sIdx,
                                        e.target.files[0]
                                      )
                                    }
                                  />
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button type="submit" disabled={loading} style={s.submitBtn}>
            {loading
              ? "Saving to Database..."
              : editData && editData._id
              ? "Update Product"
              : "Save Complete Product"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateProduct;
