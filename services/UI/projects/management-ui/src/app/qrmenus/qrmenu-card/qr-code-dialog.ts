// import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import {
//     NgxQrcodeElementTypes,
//     NgxQrcodeErrorCorrectionLevels,
// } from '@techiediaries/ngx-qrcode';

// @Component({
//     selector: 'qr-code-dialog',
//     template:
//         '<ngx-qrcode cssClass="coolQRCode" [elementType]="elementType" [errorCorrectionLevel]="correctionLevel" [value]="data.url" ></ngx-qrcode>' +
//         '<input [(ngModel)]="data.url" readonly />' +
//         '<button mat-icon-button [cdkCopyToClipboard]="data.url"><mat-icon>content_copy</mat-icon></button>' +
//         '<button mat-icon-button (click)="downloadQRCode()"><mat-icon>download</mat-icon></button>',
// })
// export class QrCodeDialog {
//     elementType = NgxQrcodeElementTypes.URL;
//     correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

//     constructor(
//         public dialogRef: MatDialogRef<QrCodeDialog>,
//         @Inject(MAT_DIALOG_DATA) public data: { url: string; menuName: string }
//     ) { }

//     public downloadQRCode() {
//         const fileNameToDownload = this.data.menuName + '_qr.png';
//         const base64Img =
//             document.getElementsByClassName('coolQRCode')[0].children[0]['src'];
//         fetch(base64Img)
//             .then((res) => res.blob())
//             .then((blob) => {
//                 // IE
//                 if (window.navigator && window.navigator.msSaveOrOpenBlob) {
//                     window.navigator.msSaveOrOpenBlob(blob, fileNameToDownload);
//                 } else {
//                     // Chrome
//                     const url = window.URL.createObjectURL(blob);
//                     const link = document.createElement('a');
//                     link.href = url;
//                     link.download = fileNameToDownload;
//                     link.click();
//                 }
//             });
//     }
// }
