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
  onDelete: (id: string) => void;
}

export default function IngredientTable({ ingredients, onDelete }: IProps) {
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
                  <div className="w-12 h-6 rounded overflow-hidden">
                    <Image
                      src={ingredient.image}
                      alt={ingredient.name}
                      width={32}
                      height={32}
                      className="rounded w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-xs text-slate-500">
                      {ingredient.category}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>€{ingredient.price}</TableCell>
              <TableCell>{ingredient.stock}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className=""
                      onClick={() =>
                        router.push(
                          "/admin/all-ingredients/" + ingredient.ingredientId,
                        )
                      }
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(ingredient._id)}
                    >
                      Delete
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
