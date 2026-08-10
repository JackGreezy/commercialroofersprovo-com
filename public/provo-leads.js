document.addEventListener("DOMContentLoaded", () => {
  const request = new URLSearchParams(location.search).get("request");
  const labels = {
    emergency: "Emergency roof leak or storm damage",
    inspection: "Commercial flat roof inspection and report",
    service: "Preventive maintenance service agreement",
    coating: "Roof coating or restoration review",
    replacement: "Commercial roof replacement planning",
    help: "Commercial roof help",
  };
  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    if (labels[request]) {
      const need = form.querySelector('[name="roofingNeed"]');
      const service = form.querySelector('[name="serviceType"]');
      if (need) need.value = labels[request];
      if (service) service.value = labels[request];
      const timeline = form.querySelector('[name="timeline"]');
      if (timeline && request === "emergency") timeline.value = "Emergency - active leak";
    }
    let status = form.querySelector("[data-form-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "provo-form-status";
      status.dataset.formStatus = "";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const original = button?.textContent || "Submit";
      if (button) { button.disabled = true; button.textContent = "Sending..."; }
      status.textContent = "Sending your roof request...";
      status.dataset.state = "pending";
      try {
        const response = await fetch(form.action || "/api/submit", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) throw new Error(payload.message || payload.error || "Request failed.");
        form.reset();
        status.textContent = payload.message || "Your roof request was received. We will follow up shortly.";
        status.dataset.state = "success";
      } catch (error) {
        status.textContent = error?.message || "We could not send your request. Please email info@commercialroofersprovo.com.";
        status.dataset.state = "error";
      } finally {
        if (button) { button.disabled = false; button.textContent = original; }
      }
    });
  });
});
