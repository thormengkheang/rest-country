"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Fuse from "fuse.js";

interface Country {
  flags: { png: string };
  name: {
    official: string;
    nativeName: {
      eng?: {
        common?: string;
        official?: string;
      };
    };
  };
  cca2: string;
  cca3: string;
  altSpellings: string[];
  idd: {
    root: string;
    suffixes?: string[];
  };
}

const useQueryCountry = () => {
  const queryFn = async () => {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=flags,name,cca2,cca3,altSpellings,idd"
    );
    return res.json();
  };

  return useQuery<Country[]>({
    queryKey: ["list-country"],
    queryFn,
  });
};

type SortingValue = "Ascending" | "Descending";

const fuzzySearch = (data: Country[], query: string) => {
  if (query === "") {
    return data;
  }

  const fuse = new Fuse(data, {
    keys: ["name.official"],
    threshold: 0.3,
  });
  const result = fuse.search(query);
  return result.map((r) => r.item);
};

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>();
  const [sorting, setSorting] = useState<SortingValue>("Ascending");
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQueryCountry();

  let content: ReactNode = <p>loading...</p>;

  const handleOnQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleOnSortingValueChange = (value: SortingValue) => {
    setSorting(value);
  };

  const handleOnClickPrev = () => {
    setPage((prev) => prev - 1);
  };

  const handleOnClickNext = () => {
    setPage((prev) => prev + 1);
  };

  const sortedByName = (a: Country, b: Country) => {
    if (sorting === "Ascending") {
      return a.name.official.localeCompare(b.name.official);
    } else {
      return b.name.official.localeCompare(a.name.official);
    }
  };

  if (!isLoading && data) {
    const itemPerPage = 25;
    const sortedData = fuzzySearch(data, query).toSorted(sortedByName);
    const endIndex = page * itemPerPage;
    const startIndex = endIndex - itemPerPage;
    const lastPage = Math.ceil(sortedData.length / itemPerPage);

    content = (
      <div className="space-y-4">
        <div className="flex gap-4 justify-between">
          <InputWithIcon
            startIcon={Search}
            placeholder="Search country name"
            className="w-[400px]"
            value={query}
            onChange={handleOnQueryChange}
          />
          <div className="flex items-center gap-2">
            <p className="text-sm">Sort by Country Name</p>
            <Select
              defaultValue={sorting}
              value={sorting}
              onValueChange={handleOnSortingValueChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Ascending">Ascending</SelectItem>
                  <SelectItem value="Descending">Descending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sortedData.slice(startIndex, endIndex).map((country, idx) => {
            const handleOnClick = () => {
              setIsDialogOpen(true);
              setSelectedCountry(country);
            };
            return (
              <Button
                key={idx}
                className="h-20 text-wrap"
                onClick={handleOnClick}
              >
                {country.name.official}
              </Button>
            );
          })}
        </div>
        {lastPage > 0 && (
          <div className="flex justify-center items-center gap-4">
            <Button disabled={page === 1} onClick={handleOnClickPrev}>
              Prev
            </Button>
            <p>{page}</p>
            <Button disabled={page === lastPage} onClick={handleOnClickNext}>
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCountry?.name.official}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2">
            <img
              src={selectedCountry?.flags.png}
              alt={selectedCountry?.name.official}
              className="w-48 h-24 border rounded-md"
            />
            <div className="space-y-2">
              <p className="p-2 border rounded-md">
                County code (2 characters): {selectedCountry?.cca2}
              </p>
              <p className="p-2 border rounded-md">
                County code (3 characters): {selectedCountry?.cca3}
              </p>
              <div className="p-2 border rounded-md">
                Native Country Name:{" "}
                <div className="pl-2">
                  <p>
                    Official: {selectedCountry?.name.nativeName?.eng?.official}
                  </p>
                  <p>Common: {selectedCountry?.name.nativeName?.eng?.common}</p>
                </div>
              </div>
              <p className="p-2 border rounded-md">
                Alternative Country Name:{" "}
                {selectedCountry?.altSpellings.join(", ")}
              </p>
              <div className="p-2 border rounded-md">
                <p>Country Calling Codes: </p>
                <div className="pl-2">
                  <p>Root: {selectedCountry?.idd.root}</p>
                  <p>Suffixes: {selectedCountry?.idd.suffixes?.join(",")}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {content}
    </main>
  );
}
