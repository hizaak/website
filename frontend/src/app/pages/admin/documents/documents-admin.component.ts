import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentService } from '../../../services/api/document.service';
import { LanguageService } from '../../../core/language.service';
import { DocumentFile, suggestDocumentFilename } from '../../../interfaces/DocumentFile';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav.component';
import { environment } from '../../../../environments/environment';

// Error codes returned by the API that have their own translation.
const KNOWN_ERROR_CODES = [
  'DOCUMENT_NAME_INVALID',
  'DOCUMENT_EXTENSION_MISMATCH',
  'DOCUMENT_EXTENSION_INVALID',
  'DOCUMENT_NAME_TAKEN',
  'DOCUMENT_NOT_FOUND',
  'DOCUMENT_FILE_MISSING',
  'DOCUMENT_TOO_LARGE',
];

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-documents',
  imports: [DatePipe, FormsModule, TranslatePipe, AdminNavComponent],
  templateUrl: './documents-admin.component.html',
})
export class DocumentsAdminComponent implements OnInit {
  @ViewChild('newFileInput') newFileInput?: ElementRef<HTMLInputElement>;

  documents: DocumentFile[] = [];
  // Translation key, so the message follows language switches.
  error: string | null = null;

  newFile: File | null = null;
  newName = '';
  uploading = false;

  editingFilename: string | null = null;
  editName = '';

  constructor(
    public documentService: DocumentService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => (this.documents = documents),
      error: (err) => this.showError(err, 'load'),
    });
  }

  onNewFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    this.newFile = file;
    this.newName = file ? suggestDocumentFilename(file.name) : '';
    this.error = null;
  }

  get newDocumentUrl(): string | null {
    const name = this.newName.trim();
    if (!name) {
      return null;
    }

    const dotIndex = name.lastIndexOf('.');
    const slug = dotIndex > 0 ? name.slice(0, dotIndex) : name;
    return `${environment.documentsUrl}/${slug}`;
  }

  createDocument(replace = false): void {
    if (!this.newFile) {
      this.error = 'admin.documentErrors.DOCUMENT_FILE_MISSING';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newName.trim());
    if (replace) {
      formData.append('replace', 'true');
    }
    formData.append('document', this.newFile);

    this.uploading = true;

    this.documentService.createDocument(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.newFile = null;
        this.newName = '';
        if (this.newFileInput) {
          this.newFileInput.nativeElement.value = '';
        }
        this.error = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading = false;

        if (
          !replace &&
          err.error?.code === 'DOCUMENT_NAME_TAKEN' &&
          confirm(this.translate.instant('admin.confirmReplaceDocument', { url: this.newDocumentUrl }))
        ) {
          this.createDocument(true);
          return;
        }

        this.showError(err, 'upload');
      },
    });
  }

  startRename(document: DocumentFile): void {
    this.editingFilename = document.filename;
    this.editName = document.filename;
  }

  cancelRename(): void {
    this.editingFilename = null;
    this.editName = '';
  }

  renameDocument(document: DocumentFile): void {
    if (!this.editName.trim()) {
      return;
    }

    this.documentService.renameDocument(document.filename, this.editName.trim()).subscribe({
      next: () => {
        this.cancelRename();
        this.error = null;
        this.loadDocuments();
      },
      error: (err) => this.showError(err, 'rename'),
    });
  }

  deleteDocument(document: DocumentFile): void {
    if (!confirm(this.translate.instant('admin.confirmDeleteDocument', { filename: document.filename }))) {
      return;
    }

    this.documentService.deleteDocument(document.filename).subscribe({
      next: () => {
        if (this.editingFilename === document.filename) {
          this.cancelRename();
        }
        this.loadDocuments();
      },
      error: (err) => this.showError(err, 'delete'),
    });
  }

  formatSize(bytes: number): { value: string; unit: 'B' | 'KB' | 'MB' } {
    const format = (value: number) =>
      value.toLocaleString(this.languageService.currentLang, { maximumFractionDigits: 1 });

    if (bytes < 1024) {
      return { value: format(bytes), unit: 'B' };
    }
    if (bytes < 1024 * 1024) {
      return { value: format(bytes / 1024), unit: 'KB' };
    }
    return { value: format(bytes / (1024 * 1024)), unit: 'MB' };
  }

  private showError(err: HttpErrorResponse, fallback: string): void {
    const code = err.error?.code;
    this.error = KNOWN_ERROR_CODES.includes(code)
      ? `admin.documentErrors.${code}`
      : `admin.documentErrors.${fallback}`;
  }
}
