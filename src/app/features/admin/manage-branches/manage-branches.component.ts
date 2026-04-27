import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-manage-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-branches.component.html'
})
export class ManageBranchesComponent implements OnInit {
  branches: Branch[] = [];
  loading = true;
  showForm = false;
  editingBranch: Branch | null = null;

  form = {
    name: '',
    nameAr: '',
    slug: '',
    imageUrl: '',
    isDefault: false
  };

  constructor(private branchService: BranchService) {}

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading = true;
    this.branchService.getAll().subscribe(res => {
      this.branches = res.data;
      this.loading = false;
    });
  }

  openAdd() {
    this.editingBranch = null;
    this.form = { name: '', nameAr: '', slug: '', imageUrl: '', isDefault: false };
    this.showForm = true;
  }

  openEdit(branch: Branch) {
    this.editingBranch = branch;
    this.form = {
      name: branch.name,
      nameAr: branch.nameAr,
      slug: branch.slug ?? '',
      imageUrl: branch.imageUrl ?? '',
      isDefault: branch.isDefault
    };
    this.showForm = true;
  }

  save() {
    if (this.editingBranch) {
      this.branchService.update(this.editingBranch.id, this.form).subscribe(() => {
        this.showForm = false;
        this.loadBranches();
      });
    } else {
      this.branchService.create(this.form).subscribe(() => {
        this.showForm = false;
        this.loadBranches();
      });
    }
  }

  delete(id: number) {
    if (!confirm('هل أنت متأكد من حذف الفرع؟')) return;
    this.branchService.delete(id).subscribe(() => this.loadBranches());
  }

  cancel() {
    this.showForm = false;
  }
}
