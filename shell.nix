{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [ nodejs nodePackages.npm-check-updates nixfmt ];
}
