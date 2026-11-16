# Clinic outreach list

How the call list for clinic outreach is made. Nothing here is about patients: the list holds practices only.
The data files themselves are not kept in this repository (it is public): they are working files for the team.

1. **Fetch.** `tools/clinic_list.py` downloads the federal NPI Registry's monthly file (NPPES, Centers for Medicare &
   Medicaid Services, https://download.cms.gov/nppes/NPI_Files.html) and keeps active organizations with a practice
   address in Texas. It needs internet access, so `.github/workflows/clinic-list.yml` runs it on GitHub whenever
   the tool or the workflow changes on this branch, and saves the result to `outreach/`. Copy the result out, then
   take that commit back off the branch.
2. **Sort.** `python3 tools/clinic_sort.py <fetched folder> <output folder>` keeps the practices whose registered
   specialty is a kind of care Jachi coordinates, makes one row per phone number, and adds the area of Texas, the
   time zone and the registry's contact. It writes `call_list.csv` (everything) and `first_wave.csv` (a first batch:
   every area and every kind of care, at most two locations per owner, the most recently updated entries first).
3. **Workbooks.** `python3 tools/clinic_books.py <output folder> <folder>` writes the tracker's first batch and the
   full list as .xlsx files.

The registry's search API is not used for the list: it looks at no more than ten specialty codes per description,
so it silently leaves practices out (measured Nov 16, 2026). The API is used only to name the specialty codes.

The website is not built or deployed from this branch.
