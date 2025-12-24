import Image from "@tiptap/extension-image";
import { Plugin } from "@tiptap/pm/state";

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      new Plugin({
        key: 'resizableImage',
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target;
              if (target.tagName !== 'IMG') {
                return false;
              }

              const pos = view.posAtDOM(target, 0);
              if (pos === null || pos < 0) {
                return false;
              }

              const node = view.state.doc.nodeAt(pos);
              if (!node || node.type.name !== 'image') {
                return false;
              }

              const rect = target.getBoundingClientRect();
              const handleSize = 20;
              const clickX = event.clientX - rect.left;
              const clickY = event.clientY - rect.top;

              // Check if click is on bottom-right corner (resize handle area)
              const isResizeHandle = 
                clickX > rect.width - handleSize && 
                clickY > rect.height - handleSize;

              if (!isResizeHandle) {
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              const startX = event.clientX;
              const startY = event.clientY;
              const startWidth = rect.width;
              const startHeight = rect.height;
              const aspectRatio = startWidth / startHeight;

              const onMouseMove = (e) => {
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(50, Math.min(startWidth + deltaX, window.innerWidth - 100));
                const newHeight = newWidth / aspectRatio;

                const tr = view.state.tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  width: Math.round(newWidth),
                  height: Math.round(newHeight),
                });

                view.dispatch(tr);
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);

              return true;
            },
          },
        },
      }),
    ];
  },
});

export default ResizableImage;

