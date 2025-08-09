import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 1. Define attributes interface
interface AttachmentAttributes {
  attachment_id: number;
  order_id: number;
  file_path: string;
  file_type?: 'image' | 'document' | 'audio';
  created_at?: Date;
}

// 2. Define creation attributes (optional fields on creation)
interface AttachmentCreationAttributes
  extends Optional<AttachmentAttributes, 'attachment_id' | 'file_type' | 'created_at'> {}

// 3. Define the model class
export class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes>
  implements AttachmentAttributes {
  public attachment_id!: number;
  public order_id!: number;
  public file_path!: string;
  public file_type?: 'image' | 'document' | 'audio';
  public created_at?: Date;
}

// 4. Init function for the model
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
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.ENUM('image', 'document', 'audio'),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'attachments',
      timestamps: false,
    }
  );

  return Attachment;
}
