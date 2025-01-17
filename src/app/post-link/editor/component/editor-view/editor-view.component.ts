import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ClearFormatService } from 'src/app/shared/services/clear-format/clear-format.service';
@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrl: './editor-view.component.scss'
})
export class EditorViewComponent {

  public constructor(
    public sanitizer: DomSanitizer,
    private formatService: ClearFormatService
  ) {}

  @Input() content: string = "";
  @Input() post_id: number = 0;

  ngOnInit() {
    this.content = this.content.replace(/<img/g, '<img class="img" ');
    this.content = this.content.replace(/<figure/g, '<figure class="figure" ');
    this.content = this.content.replace(/<figcaption/g, '<figcaption class="figcaption" ');
    this.content = this.content.replace(/<pre/g, '<pre class="pre_code" ');
    this.content = this.content.replace(/<code/g, '<code class="code" ');
    this.content = this.content.replace(/<ol/g, '<ol class="ol" ');
    this.content = this.content.replace(/<ul/g, '<ul class="ul" ');
    this.content = this.content.replace(/<ul/g, '<li class="li" ');
    this.content = this.content.replace(/<a/g, '<a class="a" ');
    this.content = this.content.replace(/<p>/g, '<p class="post_view">');
    this.content = this.content.replace(/<pre/g, '<pre class="pre_code" ');
    this.content = this.content.replace(/<blockquote/g, '<blockquote class="blockquote" ');
    this.content = this.content.replace(/<div/g, '<div class="div" ');
    this.content = this.formatService.formatForViewPost(this.content);
    this.content = this.formatService.removeInlineStyle(this.content);
    if(window.location.href.includes("/post/")) {
      const container = document.getElementById("post_container");
      container!.style.height = "auto";
      container!.removeAttribute("id");
    }
    this.timer();
  }

  timer() {
    setTimeout(() => {
      const e = document.getElementById(`post_${this.post_id}`) == null ? null : document.getElementById(`post_${this.post_id}`);
      if (e == null)
        this.timer();
      else {
        e.innerHTML = this.content;
      }
    }, 100);
  }
}
