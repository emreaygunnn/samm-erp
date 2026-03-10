import mongoose, { Schema, Document } from "mongoose";

// Yetki detayları için bir alt şema
interface IPermission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface IRol extends Document {
  ad: string;
  yetkiler: {
    kullanici: IPermission;
    urun: IPermission;
    siparis: IPermission;
  };
}

// Alt şemayı tanımlayalım
const permissionSchema = new Schema<IPermission>(
  {
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false },
); // Her yetki alt objesi için ayrı bir ID'ye gerek yok

const rolSchema = new Schema<IRol>(
  {
    ad: { type: String, required: true, unique: true },
    yetkiler: {
      kullanici: { type: permissionSchema, required: true },
      urun: { type: permissionSchema, required: true },
      siparis: { type: permissionSchema, required: true },
    },
  },
  { toJSON: { virtuals: true } },
);

export const RolModel = mongoose.model<IRol>("Rol", rolSchema);
