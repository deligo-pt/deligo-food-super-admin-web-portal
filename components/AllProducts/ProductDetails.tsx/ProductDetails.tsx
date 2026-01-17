"use client";

import { TProduct } from "@/types/product.type";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  InfoIcon,
  PackageIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface IProps {
  product: TProduct;
}

export default function ProductDetails({ product }: IProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "Limited":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "Out of Stock":
        return <XCircleIcon className="w-4 h-4" />;
      case "Limited":
        return <AlertCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-[#DC3173] to-[#e45a92] p-6 flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold text-white"
          variants={itemVariants as Variants}
        >
          Product Details
        </motion.h1>
        {/* <motion.div
          variants={itemVariants as Variants}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <button
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all"
            aria-label="Delete product"
          >
            <Trash2Icon className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </motion.div> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Product Images */}
        <motion.div
          className="col-span-1 md:col-span-1"
          variants={itemVariants as Variants}
        >
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <PackageIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <motion.div
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden cursor-pointer ${
                    index === currentImageIndex ? "ring-2 ring-[#DC3173]" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        {/* Product Info */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <motion.div variants={itemVariants as Variants}>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              <span className="text-sm text-gray-500">
                ID: {product.productId}
              </span>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isApproved
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.isApproved ? "Approved" : "Not Approved"}
              </div>
              {product.meta.isFeatured && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Featured
                </div>
              )}
            </div>
          </motion.div>
          {/* Pricing */}
          <motion.div
            className="bg-gray-50 p-4 rounded-lg"
            variants={itemVariants as Variants}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Pricing
            </h2>
            <div className="flex items-center gap-2 mb-2"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#DC3173]">
                {product.pricing.currency}{" "}
                {product.pricing.finalPrice.toFixed(2)}
              </span>
              {product?.pricing?.discount ? (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    {product.pricing.currency}{" "}
                    {product.pricing.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round(
                      (product.pricing.discount / product.pricing.price) * 100
                    )}
                    % off
                  </span>
                </>
              ) : (
                ""
              )}
            </div>
            {product.pricing.tax ? (
              <p className="text-sm text-gray-500 mt-1">
                Includes {product.pricing.tax}% tax
              </p>
            ) : (
              ""
            )}
          </motion.div>
          {/* Stock */}
          <motion.div variants={itemVariants as Variants}>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBagIcon className="w-5 h-5 text-[#DC3173]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Stock Information
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStockStatusColor(
                  product.stock.availabilityStatus
                )}`}
              >
                {getStockStatusIcon(product.stock.availabilityStatus)}
                {product.stock.availabilityStatus}
              </div>
              <span className="text-gray-700">
                {product.stock.quantity} {product.stock.unit} available
              </span>
            </div>
          </motion.div>
          {/* Description */}
          <motion.div variants={itemVariants as Variants}>
            <div className="flex items-center gap-2 mb-2">
              <InfoIcon className="w-5 h-5 text-[#DC3173]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </motion.div>
          {/* Category & Brand */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={itemVariants as Variants}
          >
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-gray-900">{product.category}</p>
              {product.subCategory && (
                <p className="mt-1 text-gray-700">Sub: {product.subCategory}</p>
              )}
            </div>
            {product.brand && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                <p className="mt-1 text-gray-900">{product.brand}</p>
              </div>
            )}
          </motion.div>
          {/* Vendor */}
          <motion.div
            className="border border-gray-200 rounded-lg p-4"
            variants={itemVariants as Variants}
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldIcon className="w-5 h-5 text-[#DC3173]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Vendor Information
              </h2>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">
                  {product.vendorId?.businessDetails?.businessName}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.vendorId?.businessDetails?.businessType}
                </p>
              </div>
            </div>
          </motion.div>
          {/* Delivery Info */}
          {product.deliveryInfo && (
            <motion.div
              className="bg-gray-50 p-4 rounded-lg"
              variants={itemVariants as Variants}
            >
              <div className="flex items-center gap-2 mb-2">
                <TruckIcon className="w-5 h-5 text-[#DC3173]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Delivery Type
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900">
                      {product.deliveryInfo.deliveryType}
                    </span>
                    {product.deliveryInfo.estimatedTime && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {product.deliveryInfo.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {product.deliveryInfo.deliveryCharge !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">
                        Delivery Charge:{" "}
                      </span>
                      <span className="text-gray-900">
                        {product.pricing.currency}{" "}
                        {product.deliveryInfo.deliveryCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {product.deliveryInfo.freeDeliveryAbove !== undefined && (
                    <div className="text-sm mt-1 text-green-600">
                      Free delivery above {product.pricing.currency}{" "}
                      {product.deliveryInfo.freeDeliveryAbove.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <motion.div variants={itemVariants as Variants}>
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="w-5 h-5 text-[#DC3173]" />
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#DC3173] bg-opacity-10 text-white"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
          {/* Rating */}
          {product.rating && (
            <motion.div variants={itemVariants as Variants}>
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="w-5 h-5 text-[#DC3173]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Ratings & Reviews
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.rating.average.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product?.rating?.average || 0)
                            ? "text-amber-400 fill-amber-400"
                            : i < (product?.rating?.average || 0)
                              ? "text-amber-400 fill-amber-400 opacity-50"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-gray-500">
                  Based on {product.rating.totalReviews}{" "}
                  {product.rating.totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </motion.div>
          )}
          {/* Meta Information */}
          <motion.div
            className="border-t border-gray-200 pt-4 text-sm text-gray-500"
            variants={itemVariants as Variants}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      product.meta.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.meta.status}
                  </span>
                </p>
                {product.meta.origin && <p>Origin: {product.meta.origin}</p>}
              </div>
              <div>
                <p>Created: {format(product.meta.createdAt, "do MMM yyyy")}</p>
                <p>Updated: {format(product.meta.updatedAt, "do MMM yyyy")}</p>
              </div>
            </div>
          </motion.div>
          {/* Action Button */}
          {/* <motion.div
            className="pt-4"
            variants={itemVariants as Variants}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <button className="w-full bg-[#DC3173] hover:bg-[#c71d62] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
              <Trash2Icon className="w-5 h-5" />
              <span>Delete Product</span>
            </button>
          </motion.div> */}
        </div>
      </div>
      {/* <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        productName={product.name}
      /> */}
    </motion.div>
  );
}
