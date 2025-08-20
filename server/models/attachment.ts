// models/attachment.ts
import { DataTypes, Model, Sequelize } from "sequelize";
import type { Optional } from "sequelize";

export interface AttachmentAttributes {
  attachment_id: number;
  order_id: number;
  original_name: string; // Assuming this is needed for download
  file_path: string;
  file_type?: "image" | "document" | "audio";
  created_at?: Date;
}

export interface AttachmentCreationAttributes
  extends Optional<
    AttachmentAttributes,
    "attachment_id" | "file_type" | "created_at"
  > {}

export class Attachment
  extends Model<AttachmentAttributes, AttachmentCreationAttributes>
  implements AttachmentAttributes
{
  public attachment_id!: number;
  public order_id!: number;
  public original_name!: string; // Assuming this is needed for download
  public file_path!: string;
  public file_type?: "image" | "document" | "audio";
  public created_at?: Date;

  get id() {
    return this.attachment_id;
  }
}

export function initAttachment(sequelize: Sequelize): typeof Attachment {
  Attachment.init(
    {
      attachment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.ENUM("image", "document", "audio"),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "attachments",
      timestamps: false, // we manage created_at manually
      underscored: true, // map camelCase <-> snake_case columns
    }
  );

  return Attachment;
}
