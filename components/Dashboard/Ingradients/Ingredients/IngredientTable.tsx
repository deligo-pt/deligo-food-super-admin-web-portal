"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TIngredient } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import {
  Cog,
  ComponentIcon,
  EuroIcon,
  MoreVertical,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  ingredients: TIngredient[];
  onEdit: (ingredient: TIngredient) => void;
  onDelete: (id: string, type: "soft" | "permanent") => void;
}

export default function IngredientTable({
  ingredients,
  onEdit,
  onDelete,
}: IProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ComponentIcon className="w-4" />
                Ingredient
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Price
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Warehouse className="w-4" />
                Stock
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={4}
              >
                No ingredients found
              </TableCell>
            </TableRow>
          )}
          {ingredients?.map((ingredient) => (
            <TableRow key={ingredient._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden relative shrink-0">
                    <Image
                      src={ingredient.image}
                      alt={ingredient.name}
                      width={48}
                      height={48}
                      className="rounded w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{ingredient.category}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">{ingredient.sku}</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>€{ingredient.price}</TableCell>
              <TableCell>
                {ingredient.stock} <span className="text-xs text-slate-400 font-normal">{ingredient.unit}</span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mr-8">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/admin/all-ingredients/" + ingredient?.sku)
                      }
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(ingredient)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive font-medium cursor-pointer"
                      onClick={() => onDelete(ingredient._id, "soft")}
                    >
                      Soft Delete
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="font-bold cursor-pointer bg-red-50/30 text-red-600 focus:bg-red-50"
                      onClick={() => onDelete(ingredient._id, "permanent")}
                    >
                      Permanent Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}