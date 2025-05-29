import {
	Entity,
	Column,
	ManyToOne,
	JoinTable,
	JoinColumn,
	OneToMany,
} from "typeorm";
import { CommonEntity } from "./Common.entity";
import { CategoryEntity } from "./Category.entity";
import { ProductEntity } from "./Product.entity";

@Entity("subcategories")
export class SubcategoryEntity extends CommonEntity {
	@Column({ type: "varchar" })
	name!: string;
	@ManyToOne(() => CategoryEntity, (category) => category.subcategories, {
		onDelete: "CASCADE",
	})
	@ManyToOne(() => CategoryEntity, (category) => category.subcategories)
	@JoinColumn({ name: "category_id" })
	category!: CategoryEntity;

	@OneToMany(() => SubcategoryEntity, (subcat) => subcat.products)
	products!: ProductEntity[];
}
