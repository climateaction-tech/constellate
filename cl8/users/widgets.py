from django.forms.widgets import ClearableFileInput
from django.utils.translation import gettext_lazy as _


class CustomClearableFileInput(ClearableFileInput):
    template_name = "widgets/custom_file_widget.html"
    initial_text = _("Currently")
    input_text = _("Change")
    clear_checkbox_label = _("Clear Picture")
